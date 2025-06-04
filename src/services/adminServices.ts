const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6969/";

export const fetchBoardTree = async () => {
  try {
    const response = await fetch(`${BASE_URL}api/admin/get-board-trees`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }
    return data;
  } catch (error) {
    console.log(error, "error in fetching board tree !f");
  }
};

export const updateBoardTree = async ({ board, className, subject }) => {
  try {
    const response = await fetch(`${BASE_URL}api/admin/update-board-tree`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board, className, subject }),
    });

    if (!response.ok) {
      throw new Error(await response.json().message);
    }

    return await response.json();
  } catch (error) {
    console.log(error, "error updating board tree");
  }
};

export const deleteFromBoardTree = async ({ board, className, subject }) => {
  try {
    const response = await fetch(`${BASE_URL}api/admin/delete-from-boardTree`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board, className, subject }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.log("error deleting from board tree", error);
  }
};

export const updateSearchCards = async () => {
  try {
    const response = await fetch(`${BASE_URL}api/admin/update-search-cards`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    return data;
  } catch (error) {
    console.log("error updating search cards", error);
    alert("Error updating search cards. Please try again later.");
  }
};

//   special course functions

export const fetchSpecialCourses = async () => {
  try {
    const response = await fetch(`${BASE_URL}api/admin/get-special-courses`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    return data;
  } catch (error) {
    console.log("error fetching special courses", error);
  }
};

export const createSpecialCourse = async ({
  courseName,
  description,
  price,
  duration,
  imageUrl,
}) => {
  try {
    const response = await fetch(`${BASE_URL}api/admin/create-special-course`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseName,
        description,
        price,
        duration,
        imageUrl,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    return data;
  } catch (error) {
    console.log("error creating special course", error);
    alert(error.message);
  }
};

export const deleteSpecialCourse = async (courseId) => {
  try {
    const response = await fetch(`${BASE_URL}api/admin/delete-special-course`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    return data;
  } catch (error) {
    console.log("error deleting special course", error);
  }
};