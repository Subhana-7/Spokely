import API from '../api/axios.instance';

export const latestSubmission = () => API.get("/daily/task/user-latest");

export const topicGenerate = (topic:string) => API.post("/daily/task/daily-task",{topic});

export const submitResponse = (taskId:string,responses:any) => API.post("/daily/task/submit-all",{taskId:taskId,responses});