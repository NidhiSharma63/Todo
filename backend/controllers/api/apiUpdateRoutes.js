const Task = require("../../models/taskSchema");
const Project = require("../../models/projectsSchema");
/**
 * update task with index
 */

const updateTaskApi = async (req, res, next) => {
  try {
    const taskBody = req.body;
    const {
      _id,
      userId,
      index: previousIndex,
      currentIndex,
      status,
      projectName,
    } = taskBody;
    // const taskObj = await Task.findOne({ _id, userId });
    if (currentIndex === undefined || previousIndex === undefined) {
      throw new Error("Something is missing currentIndex or previousIndex");
    }

    if (currentIndex > previousIndex) {
      const tasksInRange = await Task.find({
        userId,
        status: status,
        projectName,
        index: { $gt: previousIndex, $lte: currentIndex },
      });

      // Update the index of the found tasks and save them
      const updateTasksPromises = tasksInRange?.map(async (item) => {
        item.index = item.index - 1;
        await item.save();
      });

      await Promise.all(updateTasksPromises);
    }
    if (currentIndex < previousIndex) {
      const tasksInRange = await Task.find({
        userId,
        status: status,
        projectName,
        index: { $gte: currentIndex, $lt: previousIndex },
      });
      // Update the index of the found tasks and save them
      const updateTasksPromises = tasksInRange?.map(async (item) => {
        item.index = item.index + 1;
        await item.save();
      });

      await Promise.all(updateTasksPromises);
    }
    // now update the original task as well
    const taskObj = await Task.findOne({ _id, userId });
    taskObj.index = currentIndex;
    await taskObj.save();
    res.json({ data: taskObj });
  } catch (error) {
    next(error);
  }
};

/**
 * update task with status
 */

const updateTaskWithStatus = async (req, res, next) => {
  try {
    const {
      status,
      currentIndex,
      projectName,
      userId,
      _id,
      prevStatus,
      prevIndex,
    } = req.body;
    if (
      currentIndex === undefined ||
      !status ||
      !prevStatus ||
      !projectName ||
      prevIndex === undefined
    ) {
      throw new Error(
        "Something is missing currentIndex, previousIndex,projectName, prevStatus or status"
      );
    }
    // find all related to project of that user according to status
    const allProjectRelatedTaskToStatus = await Task.find({
      status,
      userId,
      projectName,
      index: { $gte: currentIndex },
    });
    if (allProjectRelatedTaskToStatus.length > 0) {
      const updateTasksPromises = allProjectRelatedTaskToStatus?.map(
        async (item) => {
          item.index = item.index + 1;
          await item.save();
        }
      );

      await Promise.all(updateTasksPromises);
    }
    // find all the task of previous status
    const allProjectRelatedTaskToPrevStatus = await Task.find({
      status: prevStatus,
      userId,
      projectName,
      index: { $gt: prevIndex },
    });
    if (allProjectRelatedTaskToPrevStatus.length > 0) {
      const updateTasksPromises = allProjectRelatedTaskToPrevStatus?.map(
        async (item) => {
          item.index = item.index - 1;
          await item.save();
        }
      );

      await Promise.all(updateTasksPromises);
    }

    // find the updated task
    const taskObj = await Task.findOne({ _id });
    taskObj.status = status;
    taskObj.index = currentIndex;
    await taskObj.save();

    res.json({ data: taskObj });
  } catch (error) {
    next(error);
  }
};

/**
 * update task with details
 */

const updateTaskWithDetail = async (req, res, next) => {
  try {
    const taskBody = req.body;
    const { _id, userId } = taskBody;
    const taskObj = await Task.findOne({ _id, userId });

    if (!taskObj) {
      throw new Error("Task not found!");
    }
    taskObj.task = taskBody.task;
    taskObj.status = taskBody.status;
    taskObj.dueDate = taskBody.dueDate;
    taskObj.description = taskBody.description;

    await taskObj.save();
    res.json({ data: taskObj });
  } catch (error) {
    next(error);
  }
};

/**
 * update project name
 */

const updateProjectApi = async (req, res, next) => {
  try {
    const { _id, name } = req.body;

    if (!id) {
      throw new Error("Project id is required");
    }
    const project = await Project.findOne({ _id });

    if (!project) {
      throw new Error("Invalid project id");
    }

    project.name = name;
    project.save();

    const allTaskRelatedToProject = await Task.findMany({
      projectName: name,
      userId: _id,
    });
    // Update the project of the found tasks and save them
    const updateTasksPromises = allTaskRelatedToProject?.map(async (item) => {
      item.projectName = name;
      await item.save();
    });
    await Promise.all(updateTasksPromises);

    res.status(201).json({ msg: "project name updated" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateTaskApi,
  updateTaskWithStatus,
  updateTaskWithDetail,
  updateProjectApi,
};
