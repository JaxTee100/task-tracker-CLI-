#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { Command } from "commander";
import chalk from "chalk";
import { v4 as uuidv4 } from "uuid";

const program = new Command();
const TODO_FILE = path.join(process.cwd(), "todo.json");

// Load tasks from file
function loadTasks() {
  if (!fs.existsSync(TODO_FILE)) {
    return [];
  }
  const data = fs.readFileSync(TODO_FILE, "utf8");
  return JSON.parse(data);
}

// Save tasks to file
function saveTasks(tasks) {
  fs.writeFileSync(TODO_FILE, JSON.stringify(tasks, null, 2));
}

// Add a task
program
  .command("add <task>")
  .description("Add a new task")
  .action((task) => {
    const tasks = loadTasks();
    const newTask = {
      id: uuidv4(), // Generate a unique ID
      task,
      status: "todo", // Default status
      createdAt: new Date().toISOString(), // Current timestamp
      updatedAt: new Date().toISOString(), // Current timestamp
    };
    tasks.push(newTask);
    saveTasks(tasks);
    console.log(chalk.green(`Added: ${task} (ID: ${newTask.id})`));
  });

// List all tasks
program
  .command("list")
  .description("List all tasks")
  .action(() => {
    const tasks = loadTasks();
    if (tasks.length === 0) {
      console.log(chalk.yellow("No tasks found."));
    } else {
      tasks.forEach((t) => {
        let statusColor;
        switch (t.status) {
          case "done":
            statusColor = chalk.green("✓ Done");
            break;
          case "in-progress":
            statusColor = chalk.yellow("➤ In Progress");
            break;
          default:
            statusColor = chalk.red("✗ To Do");
        }
        console.log(
          `${t.id} - ${statusColor} ${t.task} (Created: ${t.createdAt}, Updated: ${t.updatedAt})`
        );
      });
    }
  });

// Mark a task as done
program
  .command("done <id>")
  .description("Mark a task as done")
  .action((id) => {
    const tasks = loadTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      console.log(chalk.red("Task not found."));
      return;
    }
    task.status = "done";
    task.updatedAt = new Date().toISOString(); // Update timestamp
    saveTasks(tasks);
    console.log(chalk.green(`Marked as done: ${task.task} (ID: ${task.id})`));
  });

// Mark a task as in progress
program
  .command("progress <id>")
  .description("Mark a task as in progress")
  .action((id) => {
    const tasks = loadTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      console.log(chalk.red("Task not found."));
      return;
    }
    task.status = "in-progress";
    task.updatedAt = new Date().toISOString(); // Update timestamp
    saveTasks(tasks);
    console.log(
      chalk.green(`Marked as in progress: ${task.task} (ID: ${task.id})`)
    );
  });

// Delete a task
program
  .command("delete <id>")
  .description("Delete a task")
  .action((id) => {
    const tasks = loadTasks();
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      console.log(chalk.red("Task not found."));
      return;
    }
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    saveTasks(tasks);
    console.log(chalk.green(`Deleted: ${deletedTask.task} (ID: ${deletedTask.id})`));
  });

// Parse CLI arguments
program.parse(process.argv);