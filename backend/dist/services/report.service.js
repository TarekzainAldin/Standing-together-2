"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSingleWorkspaceReport = exports.generateAnalysisReport = void 0;
// src/services/report.service.ts
const exceljs_1 = __importDefault(require("exceljs"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const workspace_model_1 = __importDefault(require("../models/workspace.model"));
const project_model_1 = __importDefault(require("../models/project.model"));
const task_model_1 = __importDefault(require("../models/task.model"));
/**
 * تقرير لكل المساحات
 */
const generateAnalysisReport = async () => {
    const workbook = new exceljs_1.default.Workbook();
    const worksheet = workbook.addWorksheet("Analysis Report");
    worksheet.columns = [
        { header: "Workspace", key: "workspace", width: 25 },
        { header: "Project", key: "project", width: 25 },
        { header: "Task", key: "task", width: 30 },
        { header: "Status", key: "status", width: 15 },
        { header: "Priority", key: "priority", width: 15 },
        { header: "Due Date", key: "dueDate", width: 20 },
    ];
    const reportsDir = path_1.default.join(__dirname, "../reports");
    if (!fs_1.default.existsSync(reportsDir))
        fs_1.default.mkdirSync(reportsDir);
    // استخدام lean مع Generic
    const workspaces = await workspace_model_1.default.find().lean();
    for (const ws of workspaces) {
        const projects = await project_model_1.default.find({ workspace: ws._id }).lean();
        for (const project of projects) {
            const tasks = await task_model_1.default.find({ project: project._id }).lean();
            if (tasks.length > 0) {
                for (const task of tasks) {
                    worksheet.addRow({
                        workspace: ws.name,
                        project: project.name,
                        task: task.title,
                        status: task.status,
                        priority: task.priority,
                        dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : "",
                    });
                }
            }
            else {
                worksheet.addRow({ workspace: ws.name, project: project.name });
            }
        }
        if (projects.length === 0) {
            worksheet.addRow({ workspace: ws.name });
        }
    }
    const today = new Date().toISOString().split("T")[0];
    const filePath = path_1.default.join(reportsDir, `Report_AllWorkspaces_${today}.xlsx`);
    await workbook.xlsx.writeFile(filePath);
    return filePath;
};
exports.generateAnalysisReport = generateAnalysisReport;
/**
 * @description Génère un rapport Excel pour un workspace unique (projets et tâches associées)
 * @param {string} workspaceId - Identifiant du workspace à exporter
 * @returns {Promise<string>} Chemin absolu du fichier .xlsx généré
 * @throws {Error} Si le workspace n'existe pas en base
 */
const generateSingleWorkspaceReport = async (workspaceId) => {
    // lean مع Generic
    const workspace = await workspace_model_1.default.findById(workspaceId).lean();
    if (!workspace)
        throw new Error("Workspace not found");
    const workbook = new exceljs_1.default.Workbook();
    const worksheet = workbook.addWorksheet("Analysis Report");
    worksheet.columns = [
        { header: "Workspace", key: "workspace", width: 25 },
        { header: "Project", key: "project", width: 25 },
        { header: "Task", key: "task", width: 30 },
        { header: "Status", key: "status", width: 15 },
        { header: "Priority", key: "priority", width: 15 },
        { header: "Due Date", key: "dueDate", width: 20 },
    ];
    const reportsDir = path_1.default.join(__dirname, "../reports");
    if (!fs_1.default.existsSync(reportsDir))
        fs_1.default.mkdirSync(reportsDir);
    const projects = await project_model_1.default.find({ workspace: workspace._id }).lean();
    for (const project of projects) {
        const tasks = await task_model_1.default.find({ project: project._id }).lean();
        if (tasks.length > 0) {
            for (const task of tasks) {
                worksheet.addRow({
                    workspace: workspace.name,
                    project: project.name,
                    task: task.title,
                    status: task.status,
                    priority: task.priority,
                    dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : "",
                });
            }
        }
        else {
            worksheet.addRow({ workspace: workspace.name, project: project.name });
        }
    }
    if (projects.length === 0) {
        worksheet.addRow({ workspace: workspace.name });
    }
    const today = new Date().toISOString().split("T")[0];
    const filePath = path_1.default.join(reportsDir, `Report_${workspace.name}_${today}.xlsx`);
    await workbook.xlsx.writeFile(filePath);
    return filePath;
};
exports.generateSingleWorkspaceReport = generateSingleWorkspaceReport;
