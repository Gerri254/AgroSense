#!/usr/bin/env node
/**
 * Task Logger Utility
 * Automatically logs completed tasks to DEVELOPMENT_LOG.md
 * Usage: node task-logger.js "Task description" [status]
 */

const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'DEVELOPMENT_LOG.md');
const TASK_HISTORY_FILE = path.join(__dirname, 'TASK_HISTORY.json');

// Get current timestamp
function getCurrentTimestamp() {
  const now = new Date();
  return now.toISOString().split('T')[0] + ' ' + now.toTimeString().split(' ')[0];
}

// Get current date
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Initialize task history file if it doesn't exist
function initializeTaskHistory() {
  if (!fs.existsSync(TASK_HISTORY_FILE)) {
    fs.writeFileSync(TASK_HISTORY_FILE, JSON.stringify({ tasks: [] }, null, 2));
  }
}

// Load task history
function loadTaskHistory() {
  initializeTaskHistory();
  const data = fs.readFileSync(TASK_HISTORY_FILE, 'utf8');
  return JSON.parse(data);
}

// Save task history
function saveTaskHistory(history) {
  fs.writeFileSync(TASK_HISTORY_FILE, JSON.stringify(history, null, 2));
}

// Log a completed task
function logTask(taskDescription, status = 'completed', details = {}) {
  const timestamp = getCurrentTimestamp();
  const date = getCurrentDate();

  // Load and update task history
  const history = loadTaskHistory();
  const taskEntry = {
    id: history.tasks.length + 1,
    description: taskDescription,
    status: status,
    timestamp: timestamp,
    date: date,
    details: details
  };
  history.tasks.push(taskEntry);
  saveTaskHistory(history);

  // Update markdown log
  updateMarkdownLog(taskEntry);

  console.log(`✓ Task logged: ${taskDescription}`);
  console.log(`  Status: ${status}`);
  console.log(`  Time: ${timestamp}`);

  return taskEntry;
}

// Update the markdown development log
function updateMarkdownLog(taskEntry) {
  let logContent = fs.readFileSync(LOG_FILE, 'utf8');

  // Update last updated timestamp
  logContent = logContent.replace(
    /\*Last Updated: .*\*/,
    `*Last Updated: ${taskEntry.date} ${taskEntry.timestamp.split(' ')[1]}*`
  );

  // Find the Detailed Task Log section
  const detailsSection = `\n#### [${taskEntry.status.toUpperCase()}] ${taskEntry.description}\n` +
    `**Time:** ${taskEntry.timestamp}\n` +
    `**Status:** ${taskEntry.status}\n` +
    `**Task ID:** #${taskEntry.id}\n` +
    (Object.keys(taskEntry.details).length > 0 ? `**Details:** ${JSON.stringify(taskEntry.details, null, 2)}\n` : '') +
    `---\n`;

  // Insert after "### [current date]" or create new date section
  const dateHeader = `### ${taskEntry.date}`;
  if (logContent.includes(dateHeader)) {
    // Insert after the date header
    const dateHeaderIndex = logContent.indexOf(dateHeader);
    const nextSectionIndex = logContent.indexOf('\n##', dateHeaderIndex + 1);
    const insertPosition = nextSectionIndex !== -1 ? nextSectionIndex : logContent.lastIndexOf('---\n\n##');

    logContent = logContent.slice(0, insertPosition) + '\n' + detailsSection + logContent.slice(insertPosition);
  } else {
    // Create new date section
    const insertPosition = logContent.indexOf('## Detailed Task Log') + '## Detailed Task Log'.length;
    const newDateSection = `\n\n${dateHeader}\n${detailsSection}`;
    logContent = logContent.slice(0, insertPosition) + newDateSection + logContent.slice(insertPosition);
  }

  fs.writeFileSync(LOG_FILE, logContent);
}

// Mark a task as completed in the markdown checklist
function markTaskCompleted(taskDescription) {
  let logContent = fs.readFileSync(LOG_FILE, 'utf8');

  // Find and update the checkbox
  const checkboxPattern = new RegExp(`- \\[ \\] ${taskDescription.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
  logContent = logContent.replace(checkboxPattern, `- [x] ${taskDescription}`);

  fs.writeFileSync(LOG_FILE, logContent);
  console.log(`✓ Marked as completed in checklist: ${taskDescription}`);
}

// Generate a summary report
function generateSummary() {
  const history = loadTaskHistory();
  const totalTasks = history.tasks.length;
  const completedTasks = history.tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = history.tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = history.tasks.filter(t => t.status === 'pending').length;

  console.log('\n=== Development Progress Summary ===');
  console.log(`Total Tasks: ${totalTasks}`);
  console.log(`Completed: ${completedTasks}`);
  console.log(`In Progress: ${inProgressTasks}`);
  console.log(`Pending: ${pendingTasks}`);
  console.log(`Completion Rate: ${totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0}%`);
  console.log('===================================\n');
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('Usage:');
    console.log('  node task-logger.js log "Task description" [status] [details]');
    console.log('  node task-logger.js complete "Task description"');
    console.log('  node task-logger.js summary');
    console.log('\nStatus options: completed, in_progress, pending, blocked');
    process.exit(1);
  }

  switch (command) {
    case 'log':
      const description = args[1];
      const status = args[2] || 'completed';
      const details = args[3] ? JSON.parse(args[3]) : {};
      if (!description) {
        console.error('Error: Task description required');
        process.exit(1);
      }
      logTask(description, status, details);
      break;

    case 'complete':
      const taskDesc = args[1];
      if (!taskDesc) {
        console.error('Error: Task description required');
        process.exit(1);
      }
      logTask(taskDesc, 'completed');
      markTaskCompleted(taskDesc);
      break;

    case 'summary':
      generateSummary();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

// Export for use as module
module.exports = {
  logTask,
  markTaskCompleted,
  generateSummary,
  loadTaskHistory
};
