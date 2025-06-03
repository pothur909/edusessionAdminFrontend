// boardData.ts
export type BoardData = {
  [board: string]: {
    [className: string]: string[];
  };
};

export const boardData: BoardData = {
  CBSE: {
    "Class 7": ["Maths", "Science", "English", "Social Science – History", "Social Science – Geography", "Social Science – Civics", "Hindi", "Computer Science / AI"],
    "Class 8": ["Maths", "Science", "English", "Social Science – History", "Social Science – Geography", "Social Science – Civics", "Hindi", "Computer Science / AI"],
    "Class 9": ["Maths", "Physics", "Chemistry", "Biology", "English", "Social Science – History", "Social Science – Geography", "Social Science – Civics", "Hindi", "Economics", "Information Technology / AI"],
    "Class 10": ["Maths", "Physics", "Chemistry", "Biology", "English", "Social Science – History", "Social Science – Geography", "Social Science – Civics", "Hindi", "Economics", "Information Technology / AI"],
    "Class 11": ["Maths", "Physics", "Chemistry", "English", "Biology"],
    "Class 12": ["Maths", "Physics", "Chemistry", "English", "Biology"],
  },
  ICSE: {
    "Class 7": ["Maths", "Science", "English", "Hindi", "Social Science – History", "Social Science – Geography", "Social Science – Civics", "Computer Applications"],
    "Class 8": ["Maths", "Science", "English", "Hindi", "Social Science – History", "Social Science – Geography", "Social Science – Civics", "Computer Applications"],
    "Class 9": ["Maths", "Physics", "Chemistry", "Biology", "English", "Social Science – History", "Social Science – Geography", "Social Science – Civics", "Hindi", "Economics", "Information Technology / AI"],
    "Class 10": ["Maths", "Physics", "Chemistry", "Biology", "English"],
    "Class 11": ["Maths", "Physics", "Chemistry", "Biology", "English"],
    "Class 12": ["Maths", "Physics", "Chemistry", "Biology", "English"],
  },
  State: {
    "Class 7": ["Maths", "Science", "English", "Hindi", "Social Science – History", "Social Science – Geography", "Social Science – Civics", "Computer Science", "Economics"],
    "Class 8": ["Maths", "Science", "English", "Hindi", "Social Science – History", "Social Science – Geography", "Social Science – Civics", "Computer Science", "Economics"],
    "Class 9": ["Maths", "Physics", "Chemistry", "Biology", "English", "Hindi", "Social Science – History", "Social Science – Geography", "Social Science – Civics", "Computer Science", "Economics"],
    "Class 10": ["Maths", "Physics", "Chemistry", "Biology", "English", "Hindi", "Social Science – History", "Social Science – Geography", "Social Science – Civics", "Computer Science", "Economics"],
    "Class 11": ["Maths", "Physics", "Chemistry", "Biology", "English", "Sanskrit"],
    "Class 12": ["Maths", "Physics", "Chemistry", "Biology", "English", "Sanskrit"],
  },
  IB: {
    "Class 7": ["English", "Hindi", "Integrated Sciences", "Maths", "Individuals & Societies - History", "Individuals & Societies - Geography", "Individuals & Societies - Civics"],
    "Class 8": ["English", "Hindi", "Integrated Sciences", "Maths", "Individuals & Societies - History", "Individuals & Societies - Geography", "Individuals & Societies - Civics", "Science"],
    "Class 9": ["English", "Hindi", "Integrated Sciences", "Maths", "Individuals & Societies - History", "Individuals & Societies - Geography", "Individuals & Societies - Civics", "Physics", "Chemistry", "Biology"],
    "Class 10": ["English", "Hindi", "Integrated Sciences", "Maths", "Individuals & Societies - History", "Individuals & Societies - Geography", "Individuals & Societies - Civics", "Physics", "Chemistry", "Biology", "Preparation for IGCSE"],
  },
  IGCSE: {
    "Class 7": ["English", "Hindi", "Maths", "ICT (Information and Communication Technology)", "Science - Integrated : Physics, Chemistry, Biology"],
    "Class 8": ["English", "Hindi", "Maths", "ICT (Information and Communication Technology)", "Physics", "Chemistry", "Biology"],
    "Class 9": ["English", "Hindi", "Maths", "ICT (Information and Communication Technology)/Computer Science", "Physics", "Chemistry", "Biology", "Economics"],
    "Class 10": ["English", "Hindi", "Maths", "ICT (Information and Communication Technology)/Computer Science", "Physics", "Chemistry", "Biology", "Economics"],
  },
  British: {
    "Class 7": ["English", "Hindi", "Maths", "Science", "History", "Geography", "Computing"],
    "Class 8": ["English", "Hindi", "Maths", "Science", "History", "Geography", "Computing"],
    "Class 9": ["English", "Hindi", "Maths", "Science", "History", "Geography", "Computing"],
    "Class 10": ["English", "Hindi", "Maths", "Science", "History", "Geography", "Computing"],
  },
};

// Utility functions for data transformation
export class BoardDataUtils {
  /**
   * Get all available boards
   */
  static getBoards(): string[] {
    return Object.keys(boardData);
  }

  /**
   * Get all classes for a specific board
   */
  static getClassesForBoard(board: string): string[] {
    if (!boardData[board]) return [];
    return Object.keys(boardData[board]);
  }

  /**
   * Get all subjects for a specific board and class
   */
  static getSubjectsForBoardAndClass(board: string, className: string): string[] {
    if (!boardData[board] || !boardData[board][className]) return [];
    return boardData[board][className];
  }

  /**
   * Get all unique subjects across all boards and classes
   */
  static getAllUniqueSubjects(): string[] {
    const subjects = new Set<string>();
    
    Object.values(boardData).forEach(board => {
      Object.values(board).forEach(classSubjects => {
        classSubjects.forEach(subject => subjects.add(subject));
      });
    });
    
    return Array.from(subjects).sort();
  }

  /**
   * Get all subjects for a specific board (across all classes)
   */
  static getAllSubjectsForBoard(board: string): string[] {
    if (!boardData[board]) return [];
    
    const subjects = new Set<string>();
    Object.values(boardData[board]).forEach(classSubjects => {
      classSubjects.forEach(subject => subjects.add(subject));
    });
    
    return Array.from(subjects).sort();
  }

  /**
   * Check if a subject is available for a specific board and class
   */
  static isSubjectAvailable(board: string, className: string, subject: string): boolean {
    const subjects = this.getSubjectsForBoardAndClass(board, className);
    return subjects.includes(subject);
  }

  /**
   * Get boards that offer a specific subject
   */
  static getBoardsForSubject(subject: string): string[] {
    const boards: string[] = [];
    
    Object.entries(boardData).forEach(([board, classes]) => {
      const hasSubject = Object.values(classes).some(classSubjects => 
        classSubjects.includes(subject)
      );
      if (hasSubject) {
        boards.push(board);
      }
    });
    
    return boards;
  }

  /**
   * Get classes that offer a specific subject for a specific board
   */
  static getClassesForSubject(board: string, subject: string): string[] {
    if (!boardData[board]) return [];
    
    const classes: string[] = [];
    Object.entries(boardData[board]).forEach(([className, subjects]) => {
      if (subjects.includes(subject)) {
        classes.push(className);
      }
    });
    
    return classes;
  }

  /**
   * Search subjects by name (case-insensitive partial match)
   */
  static searchSubjects(searchTerm: string): string[] {
    const allSubjects = this.getAllUniqueSubjects();
    return allSubjects.filter(subject => 
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  /**
   * Get board data structure for a specific board
   */
  static getBoardData(board: string): { [className: string]: string[] } | null {
    return boardData[board] || null;
  }

  /**
   * Validate if board-class-subject combination is valid
   */
  static validateCombination(board: string, className: string, subjects: string[]): {
    isValid: boolean;
    invalidSubjects: string[];
  } {
    const availableSubjects = this.getSubjectsForBoardAndClass(board, className);
    const invalidSubjects = subjects.filter(subject => !availableSubjects.includes(subject));
    
    return {
      isValid: invalidSubjects.length === 0,
      invalidSubjects
    };
  }

  /**
   * Get formatted board data for dropdown options
   */
  static getBoardOptions(): Array<{ value: string; label: string }> {
    return this.getBoards().map(board => ({
      value: board,
      label: board
    }));
  }

  /**
   * Get formatted class options for a specific board
   */
  static getClassOptions(board: string): Array<{ value: string; label: string }> {
    return this.getClassesForBoard(board).map(className => ({
      value: className,
      label: className
    }));
  }

  /**
   * Get formatted subject options for a specific board and class
   */
  static getSubjectOptions(board: string, className: string): Array<{ value: string; label: string }> {
    return this.getSubjectsForBoardAndClass(board, className).map(subject => ({
      value: subject,
      label: subject
    }));
  }
}