import { configureStore } from "@reduxjs/toolkit";
import userSlice from "src/redux/auth/userSlice";
import booleanSlice from "src/redux/boolean/booleanSlice";
import projectSlice from "src/redux/projects/projectSlice";
import taskSlice from "src/redux/task/taskSlice";

const store = configureStore({
  reducer: {
    user: userSlice,
    boolean: booleanSlice,
    project: projectSlice,
    task: taskSlice,
  },
});

export default store;
