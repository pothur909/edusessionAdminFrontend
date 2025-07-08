"use client";

import { useState, ChangeEvent, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Alert,
  Snackbar,
  Autocomplete,
} from "@mui/material";
import { useRouter } from "next/navigation";


interface TeacherData {
  _id?: string;
  name: string;
  phoneNumber: string;
  email: string;
  board: string[];
  classes: string[];
  subjects: string[];
  languages: String[];
  additionalCourse: String[];
  expectedSalary: String;
  experience: string;
  qualification: string;
  note: string;
  resumeLink: string;
  status:
    | "new"
    | "interview"
    | "interviewdone"
    | "contacted"
    | "rejected"
    | "rejectafterinterview"
    | "appointed";
}

interface ClassData {
  _id: {
    $oid: string;
  };
  name: string;
  subjects: string[];
}

interface BoardData {
  _id: {
    $oid: string;
  };
  board: string;
  classes: ClassData[];
  __v: number;
}

interface TeacherFormProps {
  initialData?: TeacherData;
  onSuccess?: () => void;
  onError?: () => void;
  isEdit?: boolean;
}

type FormErrors = Partial<Record<keyof TeacherData, string>> & {
  submit?: string;
};

const statusOptions = [
  "new",
  "interview",
  "interviewdone",
  "contacted",
  "rejected",
  "rejectafterinterview",
  "appointed",
] as const;

const indianLanguageOptions = [
  'English',
  'Hindi',
  'Bengali', 
  'Telugu',
  'Marathi',
  'Tamil',
  'Gujarati',
  'Urdu',
  'Kannada',
  'Odia',
  'Malayalam',
  'Punjabi',
  'Assamese',
  'Maithili',
  'Sanskrit',
  'Nepali',
  'Konkani',
  'Manipuri',
  'Sindhi',
  'Dogri',
  'Kashmiri',
  'Santali',
  'Bodo',
  'Rajasthani',
  'Bhojpuri',
  'Haryanvi',
  'Chhattisgarhi',
  'Magahi',
  'Nagpuri',
  'Kumaoni',
  'Garhwali'
];

const baseUrl = process.env.BASE_URL ;

export default function TeacherForm({
  initialData,
  onSuccess,
  onError,
  isEdit = false,
}: TeacherFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<TeacherData>({
    name: initialData?.name || "",
    phoneNumber: initialData?.phoneNumber || "",
    email: initialData?.email || "",
    board: initialData?.board || [],
    classes: initialData?.classes || [],
    subjects: initialData?.subjects || [],
    languages: initialData?.languages || [],
    expectedSalary: initialData?.expectedSalary || "",
    additionalCourse: initialData?.additionalCourse || [],
    experience: initialData?.experience || "",
    qualification: initialData?.qualification || "",
    note: initialData?.note || "",
    resumeLink: initialData?.resumeLink || "",
    status: initialData?.status || "new",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const [boardsData, setBoardsData] = useState<BoardData[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassData[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch boards data first
        const response = await fetch(`${baseUrl}/api/admin/get-board-trees`);
        if (!response.ok) throw new Error("Failed to fetch boards data");
        const data = await response.json();
        setBoardsData(data);

        // Then set initial form data if available
        if (initialData) {
          setFormData(initialData);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        setSnackbar({
          open: true,
          message: "Failed to initialize form data",
          severity: "error",
        });
      }
    };

    initializeData();
  }, [initialData]);

  // Update available classes and subjects when board selection changes
  useEffect(() => {
    if (formData.board.length > 0) {
      console.log("Selected Boards:", formData.board);
      console.log("All Boards Data:", boardsData);

      const selectedBoardsData = boardsData.filter((b) => {
        console.log(
          "Checking board:",
          b.board,
          "against selected:",
          formData.board
        );
        return formData.board.includes(b.board);
      });

      console.log("Selected Boards Data:", selectedBoardsData);

      const allClasses = selectedBoardsData.flatMap((b) => {
        console.log("Classes for board", b.board, ":", b.classes);
        return b.classes || [];
      });

      console.log("All Available Classes:", allClasses);
      setAvailableClasses(allClasses);

      // Only reset classes and subjects if we're not initializing from initialData
      if (!initialData) {
        setFormData((prev) => ({
          ...prev,
          classes: [],
          subjects: [],
        }));
      }
    } else {
      setAvailableClasses([]);
      setAvailableSubjects([]);
    }
  }, [formData.board, boardsData, initialData]);

  // Update available subjects when class selection changes
  useEffect(() => {
    if (formData.classes.length > 0) {
      console.log("Selected Classes:", formData.classes);
      console.log("Available Classes:", availableClasses);

      const selectedClasses = availableClasses.filter((c) => {
        console.log(
          "Checking class:",
          c.name,
          "against selected:",
          formData.classes
        );
        return formData.classes.includes(c.name);
      });

      console.log("Filtered Classes:", selectedClasses);

      const allSubjects = [
        ...new Set(
          selectedClasses.flatMap((c) => {
            console.log("Subjects for class", c.name, ":", c.subjects);
            return c.subjects || [];
          })
        ),
      ];

      console.log("Final Subjects:", allSubjects);
      setAvailableSubjects(allSubjects);

      // Only reset subjects if we're not initializing from initialData
      if (!initialData) {
        setFormData((prev) => ({
          ...prev,
          subjects: [],
        }));
      }
    } else {
      setAvailableSubjects([]);
    }
  }, [formData.classes, availableClasses, initialData]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultiSelect = (e: SelectChangeEvent<string[]>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

    const handleLanguageChange = (event: any, newValue: string[]) => {
    setFormData((prev) => ({
      ...prev,
      languages: newValue,
    }));
  };

  const handleAdditionalCourseChange = (event: any, newValue: string[]) => {
    setFormData((prev) => ({
      ...prev,
      additionalCourse: newValue,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    try {
      const urlRes = await fetch(
        `${baseUrl}/api/generateUrl?fileName=${file.name}&fileType=${file.type}`
      );
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const data = await urlRes.json();

      const uploadUrl = data.url;
      const cleanUrl = uploadUrl.split("?")[0]; // URL without query params

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) throw new Error("Failed to upload file to S3");

      return cleanUrl;
    } catch (err) {
      console.error("Upload error:", err);
      throw err;
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof TeacherData, string>> = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "Phone number must be 10 digits";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email";

    if (!formData.board.length) newErrors.board = "Select at least one board";
    if (!formData.classes.length)
      newErrors.classes = "Select at least one class";
    if (!formData.subjects.length)
      newErrors.subjects = "Select at least one subject";
    if (!formData.experience) newErrors.experience = "Experience is required";
    if (!formData.qualification)
      newErrors.qualification = "Qualification is required";
    if (!isEdit && !selectedFile)
      newErrors.resumeLink = "Resume file is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      let resumeUrl = formData.resumeLink;
      if (selectedFile) {
        resumeUrl = await uploadFile(selectedFile);
      }

      const endpoint = isEdit
        ? `${baseUrl}/api/teachers/${initialData?._id}`
        : `${baseUrl}/api/addteacher`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, resumeLink: resumeUrl }),
      });

      if (!res.ok) {
        throw new Error(
          isEdit ? "Failed to update teacher" : "Failed to add teacher"
        );
      }

      setSnackbar({
        open: true,
        message: isEdit
          ? "Teacher updated successfully!"
          : "Teacher added successfully!",
        severity: "success",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        // Reset form if not in edit mode
        if (!isEdit) {
          setFormData({
            name: "",
            phoneNumber: "",
            email: "",
            board: [],
            classes: [],
            subjects: [],
            languages: [],
            expectedSalary: "",
            additionalCourse: [],
            experience: "",
            qualification: "",
            note: "",
            resumeLink: "",
            status: "new",
          });
          setSelectedFile(null);
        }

        // Refresh the page after 2 seconds
        setTimeout(() => {
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: isEdit
          ? "Failed to update teacher. Please try again."
          : "Failed to add teacher. Please try again.",
        severity: "error",
      });
      if (onError) {
        onError();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ p: 3, maxWidth: "1200px", margin: "0 auto" }}
    >
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ mb: 4, textAlign: "center", color: "primary.main" }}
        >
          {isEdit ? "Edit Teacher" : "Add New Teacher"}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              variant="outlined"
            />
          </Box>
          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
              variant="outlined"
            />
          </Box>
          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              variant="outlined"
            />
          </Box>
          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <FormControl
              fullWidth
              error={!!errors.board}
              sx={{ minHeight: "80px" }}
            >
              <InputLabel>Board</InputLabel>
              <Select
                multiple
                name="board"
                value={formData.board}
                onChange={handleMultiSelect}
                input={<OutlinedInput label="Board" />}
                renderValue={(selected) => (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      minHeight: "40px",
                      alignItems: "center",
                    }}
                  >
                    {selected.map((v) => (
                      <Chip key={v} label={v} color="primary" size="medium" />
                    ))}
                  </Box>
                )}
                sx={{ minHeight: "60px" }}
              >
                {boardsData.map((board) => (
                  <MenuItem key={board._id.$oid} value={board.board}>
                    {board.board}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <FormControl
              fullWidth
              error={!!errors.classes}
              sx={{ minHeight: "80px" }}
            >
              <InputLabel>Classes</InputLabel>
              <Select
                multiple
                name="classes"
                value={formData.classes}
                onChange={handleMultiSelect}
                input={<OutlinedInput label="Classes" />}
                renderValue={(selected) => (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      minHeight: "40px",
                      alignItems: "center",
                    }}
                  >
                    {selected.map((v) => (
                      <Chip key={v} label={v} color="primary" size="medium" />
                    ))}
                  </Box>
                )}
                sx={{ minHeight: "60px" }}
                disabled={formData.board.length === 0}
              >
                {availableClasses.map((cls) => (
                  <MenuItem key={cls._id.$oid} value={cls.name}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <FormControl
              fullWidth
              error={!!errors.subjects}
              sx={{ minHeight: "80px" }}
            >
              <InputLabel>Subjects</InputLabel>
              <Select
                multiple
                name="subjects"
                value={formData.subjects}
                onChange={handleMultiSelect}
                input={<OutlinedInput label="Subjects" />}
                renderValue={(selected) => (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      minHeight: "40px",
                      alignItems: "center",
                    }}
                  >
                    {selected.map((v) => (
                      <Chip key={v} label={v} color="primary" size="medium" />
                    ))}
                  </Box>
                )}
                sx={{ minHeight: "60px" }}
                disabled={formData.classes.length === 0}
              >
                {availableSubjects.map((sub) => (
                  <MenuItem key={sub} value={sub}>
                    {sub}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <TextField
              fullWidth
              label="Experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              error={!!errors.experience}
              helperText={errors.experience}
              variant="outlined"
            />
          </Box>
          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <TextField
              fullWidth
              label="Qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              error={!!errors.qualification}
              helperText={errors.qualification}
              variant="outlined"
            />
          </Box>
                   <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <Autocomplete
              multiple
              options={indianLanguageOptions}
              value={formData.languages as string[]}
              onChange={handleLanguageChange}
              filterSelectedOptions
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Languages"
                  placeholder="Search and select languages..."
                  variant="outlined"
                />
              )}
              sx={{
                '& .MuiAutocomplete-tag': {
                  margin: '2px',
                },
              }}
            />
          </Box>

                    {/* Additional Course Autocomplete Field */}
          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <Autocomplete
              multiple
              options={[]}
              value={formData.additionalCourse as string[]}
              onChange={handleAdditionalCourseChange}
              freeSolo
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Additional Courses"
                  placeholder="Type and press Enter to add courses..."
                  variant="outlined"
                  helperText="Type course names and press Enter to add them"
                />
              )}
              sx={{
                '& .MuiAutocomplete-tag': {
                  margin: '2px',
                },
              }}
            />
          </Box>
          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <TextField
              fullWidth
              label="Salary"
              name="expectedSalary"
              value={formData.expectedSalary}
              onChange={handleChange}
              error={!!errors.expectedSalary}
              helperText={errors.expectedSalary}
              variant="outlined"
            />
          </Box>

          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                input={<OutlinedInput label="Status" />}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <TextField
              fullWidth
              label="Note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              multiline
              rows={4}
              variant="outlined"
            />
          </Box>
          <Box sx={{ flex: "1 1 100%", minWidth: "300px" }}>
            <Box sx={{ mb: 2 }}>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
                id="resume-upload"
              />
              <label htmlFor="resume-upload">
                <Button variant="outlined" component="span" sx={{ mr: 2 }}>
                  {isEdit ? "Update Resume" : "Upload Resume"}
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="body2" color="text.secondary">
                  Selected file: {selectedFile.name}
                </Typography>
              )}
              {!isEdit && errors.resumeLink && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {errors.resumeLink}
                </Typography>
              )}
            </Box>
          </Box>
          <Box
            sx={{
              flex: "1 1 100%",
              display: "flex",
              justifyContent: "center",
              mt: 2,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              size="large"
              sx={{ minWidth: "200px" }}
            >
              {isSubmitting ? "Submitting..." : isEdit ? "Update" : "Submit"}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
