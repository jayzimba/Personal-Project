import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase;

const getDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("projectmanagement.db");
  }
  return db;
};

export interface Project {
  id?: number;
  title: string;
  description: string;
  status: "ongoing" | "completed" | "planned";
  progress: number;
  team: number;
  created_at?: string;
}

export interface Task {
  id?: number;
  project_id: number;
  title: string;
  description?: string;
  status: "pending" | "completed";
  due_date?: string;
  created_at?: string;
}

export const initDatabase = async () => {
  try {
    const database = await getDb();
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        progress INTEGER DEFAULT 0,
        team INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        due_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id)
      );
    `);
    console.log("Database initialized");
    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
};

export const addProject = async (project: Project): Promise<number> => {
  const database = await getDb();
  try {
    await database.runAsync(`
      INSERT INTO projects (title, description, status, progress, team)
      VALUES ('${project.title}', '${project.description}', '${project.status}', ${project.progress}, ${project.team})
    `);
    const result = await database.runAsync("SELECT last_insert_rowid() as id");
    console.log("Project added:", result);
    return (result as any)?.[0]?._array?.[0]?.id ?? 0;
  } catch (error) {
    console.error("Error adding project:", error);
    throw error;
  }
};

export const getProjects = async (): Promise<Project[]> => {
  const database = await getDb();
  try {
    const result = await database.getAllAsync(
      "SELECT * FROM projects ORDER BY created_at DESC"
    );
    console.log("Projects:", result);
    return result || [];
  } catch (error) {
    console.error("Error getting projects:", error);
    throw error;
  }
};

export const addTask = async (task: Task): Promise<number> => {
  const database = await getDb();
  try {
    await database.runAsync(
      `
      INSERT INTO tasks (project_id, title, description, status, due_date)
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        task.project_id,
        task.title,
        task.description,
        task.status,
        task.due_date,
      ]
    );
    const result = await database.runAsync("SELECT last_insert_rowid() as id");
    return (result as any)?.[0]?._array?.[0]?.id ?? 0;
  } catch (error) {
    console.error("Error adding task:", error);
    throw error;
  }
};

export const getProjectTasks = async (projectId: number): Promise<Task[]> => {
  const database = await getDb();
  try {
    const result = await database.getAllAsync(
      "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC",
      [projectId]
    );
    return result || [];
  } catch (error) {
    console.error("Error getting tasks:", error);
    throw error;
  }
};

export const updateTaskStatus = async (
  taskId: number,
  status: "pending" | "completed"
): Promise<void> => {
  const database = await getDb();
  try {
    await database.runAsync("UPDATE tasks SET status = ? WHERE id = ?", [
      status,
      taskId,
    ]);
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};
