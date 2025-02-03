import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase;

export const getDb = async () => {
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
  start_date: string;
  end_date: string;
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
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        due_date TEXT NOT NULL,
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
      INSERT INTO projects (title, description, status, progress, team, start_date, end_date)
      VALUES ('${project.title}', '${project.description}', '${project.status}', ${project.progress}, ${project.team}, '${project.start_date}', '${project.end_date}')
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
    const projects = await database.getAllAsync<Project>(
      "SELECT * FROM projects ORDER BY created_at DESC"
    );

    // Update status for each project
    for (const project of projects) {
      await updateProjectStatus(project.id!);
    }

    // Fetch updated projects
    return await database.getAllAsync<Project>(
      "SELECT * FROM projects ORDER BY created_at DESC"
    );
  } catch (error) {
    console.error("Error getting projects:", error);
    throw error;
  }
};

export const addTask = async (task: Task): Promise<boolean> => {
  const database = await getDb();
  try {
    // Get project dates to validate task due date
    const project = await database.getAllAsync<Project>(
      "SELECT start_date, end_date FROM projects WHERE id = ?",
      [task.project_id]
    );

    if (!project?.[0]) {
      throw new Error("Project not found");
    }

    const projectStartDate = new Date(project[0].start_date);
    const projectEndDate = new Date(project[0].end_date);
    const taskDueDate = new Date(task.due_date);

    // Remove time portion for date comparison
    projectStartDate.setHours(0, 0, 0, 0);
    projectEndDate.setHours(0, 0, 0, 0);
    taskDueDate.setHours(0, 0, 0, 0);

    if (taskDueDate < projectStartDate || taskDueDate > projectEndDate) {
      throw new Error(
        "Task due date must be within project start and end dates"
      );
    }

    await database.runAsync(
      `INSERT INTO tasks (project_id, title, description, status, due_date)
       VALUES (?, ?, ?, ?, ?)`,
      [
        task.project_id,
        task.title,
        task.description,
        task.status,
        task.due_date,
      ]
    );
    return true;
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

export const deleteProject = async (projectId: number): Promise<boolean> => {
  const database = await getDb();
  try {
    await database.runAsync("DELETE FROM tasks WHERE project_id = ?", [
      projectId,
    ]);
    await database.runAsync("DELETE FROM projects WHERE id = ?", [projectId]);
    return true;
  } catch (error) {
    console.error("Error deleting project:", error);
    return false;
  }
};

export const updateProjectStatus = async (projectId: number): Promise<void> => {
  const database = await getDb();
  try {
    // Get project dates and current tasks
    const project = await database.getAllAsync<Project>(
      "SELECT * FROM projects WHERE id = ?",
      [projectId]
    );

    if (!project?.[0]) return;

    const currentDate = new Date();
    const startDate = new Date(project[0].start_date);
    const endDate = new Date(project[0].end_date);

    // Get all tasks for the project
    const tasks = await database.getAllAsync<Task>(
      "SELECT * FROM tasks WHERE project_id = ?",
      [projectId]
    );

    let newStatus = "planned";

    // Check if current date is within project timeline
    if (currentDate >= startDate && currentDate <= endDate) {
      newStatus = "ongoing";
    }

    // Check if all tasks are completed
    const allTasksCompleted =
      tasks.length > 0 && tasks.every((task) => task.status === "completed");

    if (allTasksCompleted) {
      newStatus = "completed";
    }

    // Update project status
    await database.runAsync("UPDATE projects SET status = ? WHERE id = ?", [
      newStatus,
      projectId,
    ]);
  } catch (error) {
    console.error("Error updating project status:", error);
    throw error;
  }
};

export const getTasksDueToday = async (): Promise<number> => {
  const database = await getDb();
  try {
    // Get current date in local timezone
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    console.log("Checking tasks for date:", todayStr); // For debugging

    const result = await database.getAllAsync<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE date(t.due_date) <= date(?)
       AND t.status != 'completed'
       AND p.status != 'completed'`,
      [todayStr]
    );

    console.log("Tasks due count:", result?.[0]?.count); // For debugging
    return result?.[0]?.count || 0;
  } catch (error) {
    console.error("Error getting tasks due today:", error);
    return 0;
  }
};

export const deleteTask = async (taskId: number): Promise<boolean> => {
  const database = await getDb();
  try {
    await database.runAsync("DELETE FROM tasks WHERE id = ?", [taskId]);
    return true;
  } catch (error) {
    console.error("Error deleting task:", error);
    return false;
  }
};

export const updateTask = async (
  taskId: number,
  updates: Partial<Task>
): Promise<boolean> => {
  const database = await getDb();
  try {
    if (updates.due_date) {
      // Get project dates to validate task due date
      const project = await database.getAllAsync<Project>(
        "SELECT start_date, end_date FROM projects WHERE id = ?",
        [updates.project_id]
      );

      if (!project?.[0]) {
        throw new Error("Project not found");
      }

      const projectStartDate = new Date(project[0].start_date);
      const projectEndDate = new Date(project[0].end_date);
      const taskDueDate = new Date(updates.due_date);

      // Remove time portion for date comparison
      projectStartDate.setHours(0, 0, 0, 0);
      projectEndDate.setHours(0, 0, 0, 0);
      taskDueDate.setHours(0, 0, 0, 0);

      if (taskDueDate < projectStartDate || taskDueDate > projectEndDate) {
        throw new Error(
          "Task due date must be within project start and end dates"
        );
      }
    }

    await database.runAsync(
      `UPDATE tasks 
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           due_date = COALESCE(?, due_date)
       WHERE id = ?`,
      [updates.title, updates.description, updates.due_date, taskId]
    );
    return true;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const getProjectsWithTaskProgress = async (): Promise<{
  projects: Project[];
  averageProgress: number;
}> => {
  const database = await getDb();
  try {
    const projects = await getProjects();
    let totalProgress = 0;

    for (const project of projects) {
      // Get tasks for each project
      const tasks = await database.getAllAsync<Task>(
        "SELECT * FROM tasks WHERE project_id = ?",
        [project.id]
      );

      // Calculate project progress based on completed tasks
      if (tasks.length > 0) {
        const completedTasks = tasks.filter(
          (task) => task.status === "completed"
        ).length;
        project.progress = Math.round((completedTasks / tasks.length) * 100);

        // Update project progress in database
        await database.runAsync(
          "UPDATE projects SET progress = ? WHERE id = ?",
          [project.progress, project.id]
        );
      }

      totalProgress += project.progress;
    }

    const averageProgress =
      projects.length > 0 ? Math.round(totalProgress / projects.length) : 0;

    return { projects, averageProgress };
  } catch (error) {
    console.error("Error getting projects with progress:", error);
    throw error;
  }
};
