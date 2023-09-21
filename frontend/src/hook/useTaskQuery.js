import { useMutation, useQueries } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { queryClient } from 'src/index';
import {
  isBackDropLoaderDisplayed,
  isTaskDisplayed,
  isUpdatingTask,
  showLoaderForTask,
} from 'src/redux/boolean/booleanSlice';
import { projectDataInStore } from 'src/redux/projects/projectSlice';
import { statusDataInStore } from 'src/redux/status/statusSlice';
import {
  customAxiosRequestForGet,
  customAxiosRequestForPost,
} from 'src/utils/axiosRequest';
/**
 *
 * @returns Post request for adding task with status
 */
const useAddTaskQuery = () => {
  let state;
  return useMutation({
    mutationFn: (payload) => {
      const { status } = payload;
      state = status;
      return customAxiosRequestForPost('/task', 'post', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['charts-data']);
      queryClient.invalidateQueries([state]);
    },
    onError: (error) => {
      toast.error(error?.response?.data);
    },
  });
};

/**
 *
 * @returns Getting all task
 */
const useGetTaskAccordingToStatus = () => {
  const { active_project } = useSelector(projectDataInStore);
  const { total_status } = useSelector(statusDataInStore);
  const dispatch = useDispatch();

  const userQueries = useQueries({
    queries: total_status?.map((status) => {
      return {
        queryKey: [status, active_project],
        queryFn: () =>
          customAxiosRequestForGet('/task', {
            status,
            projectName: active_project,
          }),
        onSuccess: ({ data }) => {
          return data;
        },
        onSettled: () => {
          setTimeout(() => {
            dispatch(isBackDropLoaderDisplayed(false));
            dispatch(isTaskDisplayed(true));
            dispatch(showLoaderForTask(false));
            dispatch(isUpdatingTask(false));
          }, 300);
        },
      };
    }),
  });

  const data = useMemo(
    () => userQueries?.map((item) => item?.data?.data),
    [userQueries],
  );
  // const isLoading = userQueries?.[0]?.isLoading;
  // const status = userQueries?.map((item) => item?.data?.status);

  return { data };
};

/**
 *
 * @returns Update task status when task moved to same column up or down
 */

const useUpdateTaskQuery = () => {
  const { active_project } = useSelector(projectDataInStore);
  const dispatch = useDispatch();
  const [state, setState] = useState('');

  return useMutation({
    mutationFn: (payload) => {
      const { status } = payload;
      setState(status);
      return customAxiosRequestForPost('/task', 'put', payload);
    },
    onSettled: () => {
      queryClient.invalidateQueries([state, active_project]);
      setTimeout(() => {
        dispatch(isUpdatingTask(false));
      }, 500);
    },
    onError: (error) => {
      toast.error('something went wrong!');
    },
  });
};

/**
 *
 * @returns Update request drag and drop
 */

const useUpdateTaskQueryWithStatus = () => {
  const dispatch = useDispatch();
  const { active_project } = useSelector(projectDataInStore);
  const [state, setState] = useState({
    previousStatusOfTask: '',
    currentStatusOfTask: '',
  });

  return useMutation({
    mutationFn: (payload) => {
      const { status, prevStatus } = payload;
      setState({
        previousStatusOfTask: prevStatus,
        currentStatusOfTask: status,
      });
      return customAxiosRequestForPost('/task/status', 'put', payload);
    },
    onSettled: () => {
      queryClient.invalidateQueries([
        state.previousStatusOfTask,
        active_project,
      ]);
      queryClient.invalidateQueries([
        state.currentStatusOfTask,
        active_project,
      ]);
      queryClient.invalidateQueries(['charts-data']);
      setTimeout(() => {
        dispatch(isUpdatingTask(false));
      }, 1000);
    },
    onError: () => {
      toast.error('something went wrong!');
    },
  });
};

/**
 *
 * @returns Update request with details
 */

const useUpdateTaskQueryWithDetails = () => {
  let state;
  const { active_project } = useSelector(projectDataInStore);
  return useMutation({
    mutationFn: (payload) => {
      const { status } = payload;
      state = status;
      return customAxiosRequestForPost('/task/details', 'put', payload);
    },
    onSuccess: () => {
      toast.success('Task updated successfully!');
      queryClient.invalidateQueries([state, active_project]);
      queryClient.invalidateQueries(['charts-data']);
    },
    onError: (error) => {
      toast.error(error?.response?.data);
    },
  });
};

/***
 *
 * @returns Delete Task
 */

const useDeleteTask = (status) => {
  const { active_project } = useSelector(projectDataInStore);
  return useMutation({
    mutationFn: (payload) => {
      return customAxiosRequestForPost('/task', 'delete', payload);
    },
    onSuccess: () => {
      toast.success('Task deleted successfully!');
      queryClient.invalidateQueries([status, active_project]);
      queryClient.invalidateQueries(['charts-data']);
    },
    onError: (error) => {
      toast.error('something went wrong!');
    },
  });
};

/**
 *
 * @returns Getting all task for home component
 */
const useGetAllTaskAccordingToStatusForEachProject = () => {
  const { total_status } = useSelector(statusDataInStore);

  const userQueries = useQueries({
    queries: total_status.map((status) => {
      return {
        queryKey: [status, 'All-task'],
        queryFn: () =>
          customAxiosRequestForGet('/project/status/alltasks', {
            status,
          }),
        onSuccess: ({ data }) => {
          return data;
        },
      };
    }),
  });

  const data = userQueries?.map((item) => item?.data?.data);
  const isLoading = userQueries?.[0]?.isLoading;
  const status = userQueries?.map((item) => item?.data?.status);

  return { data, status, isLoading };
};

export {
  useAddTaskQuery,
  useDeleteTask,
  useGetAllTaskAccordingToStatusForEachProject,
  useGetTaskAccordingToStatus,
  useUpdateTaskQuery,
  useUpdateTaskQueryWithDetails,
  useUpdateTaskQueryWithStatus,
};
