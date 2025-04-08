import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  Plus,
  Calendar as CalendarIcon,
  Tag,
  X,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    content: "",
    scheduledFor: "",
    labels: [],
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [user, setUser] = useState("");
  const [date, setDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editedTask, setEditedTask] = useState({
    title: "",
    content: "",
    scheduledFor: "",
    labels: [],
  });
  const [availableLabels, setAvailableLabels] = useState([
    "Work",
    "Personal",
    "Urgent",
  ]);
  const [newLabelInput, setNewLabelInput] = useState("");
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [showLabelsDropdown, setShowLabelsDropdown] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("all");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedLabelFilter, setSelectedLabelFilter] = useState("all");

  const navigate = useNavigate();

  const isSameOrFutureDate = (dateStr) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(dateStr);
    const targetDate = new Date(
      target.getFullYear(),
      target.getMonth(),
      target.getDate()
    );

    return targetDate >= today;
  };
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const overdueTasks = tasks.filter((task) => {
        if (!task.scheduledFor) return false;
        return !isSameOrFutureDate(task.scheduledFor);
      });

      // Only delete overdue tasks
      overdueTasks.forEach((task) => {
        console.log(`Deleting overdue task: ${task.title}`);
        handleDelete(task.id);
      });
    }, 1000); // every 60 seconds

    return () => clearInterval(interval);
  }, [tasks]);
  useEffect(() => {
    console.log("showLabelsDropdown updated:", showLabelsDropdown);
  }, [showLabelsDropdown]);
  // Fetch tasks from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get("http://localhost:8080/getAll", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("this is from useeffect", response.data.blogs);

        const processedTasks = response.data.blogs.map((task) => ({
          ...task,
          // Handle both object and string labels
          labels: task.labels.map((label) =>
            typeof label === "object" ? label.name : label
          ),
        }));
        setTasks(processedTasks);
      } catch (error) {
        if (
          error.response?.status === 401 &&
          error.response?.data?.message === "token has been expired"
        ) {
          navigate("/");
        }
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const user = await axios.get("http://localhost:8080/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(user.data.name);
      } catch (error) {
        console.log("user related error", error);
      }
    };
    fetchUser();
  }, []);

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    if (editingTask) {
      setEditedTask({
        ...editedTask,
        scheduledFor: selectedDate.toISOString(),
      });
    } else {
      setNewTask({
        ...newTask,
        scheduledFor: selectedDate.toISOString(),
      });
    }
    setIsDatePickerOpen(false);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");

      console.log("this is the labels", newTask.labels);

      await axios.post(
        "http://localhost:8080/post",
        {
          ...newTask,
          published: true,
          scheduledFor: newTask.scheduledFor || new Date().toISOString(),
          labels: newTask.labels,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const response = await axios.get("http://localhost:8080/getAll", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const processedTasks = response.data.blogs.map((task) => ({
        ...task,
        labels: task.labels.map((label) =>
          typeof label === "object" ? label.name : label
        ),
      }));
      setTasks(processedTasks);

      setNewTask({
        title: "",
        content: "",
        scheduledFor: "",
        labels: [],
      });
      setFile(null);
      setIsAddingTask(false);
    } catch (error) {
      console.error("Error submitting task:", error);
    }
  };

  const handleUpdateTask = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const payload = {
        ...editedTask,
        scheduledFor: editedTask.scheduledFor || new Date().toISOString(),
        published: true,
        labels: editedTask.labels.map((label) => ({ name: label })), // Convert to proper format
      };

      await axios.put(`http://localhost:8080/put/${editedTask.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh tasks
      const response = await axios.get("http://localhost:8080/getAll", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const processedTasks = response.data.blogs.map((task) => ({
        ...task,
        // Handle both object and string labels
        labels: task.labels.map((label) =>
          typeof label === "object" ? label.name : label
        ),
      }));
      setTasks(processedTasks);

      setEditingTask(null);
      setSelectedTask(
        response.data.blogs.find((task) => task.id === editingTask.id)
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`http://localhost:8080/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const response = await axios.get("http://localhost:8080/getAll", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const processedTasks = response.data.blogs.map((task) => ({
        ...task,
        labels: task.labels.map((label) => label.name), // Extract label names
      }));
      setTasks(processedTasks);

      if (selectedTask && selectedTask.id === id) {
        setSelectedTask(null);
      }
    } catch (error) {
      console.log("error deleting the task", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return "Invalid date"; // Or fallback text
    const options = { year: "numeric", month: "long", day: "numeric" };
    return parsed.toLocaleDateString(undefined, options);
  };
  const handleAddTaskClick = () => {
    setSelectedTask(null);
    setEditingTask(null);
    setIsAddingTask(true);
    setDate(new Date());
    setNewTask({
      title: "",
      content: "",
      scheduledFor: "",
      labels: [],
    });
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsAddingTask(false);
    setEditingTask(null);

    const onTask = fetchPostDetails(task.id);
    const taskLabels = Array.isArray(onTask.labels)
      ? onTask.labels
      : onTask.labels
      ? [onTask.labels]
      : [];

    setEditedTask({
      title: onTask.title,
      content: onTask.content,
      scheduledFor: onTask.scheduledFor,
      labels: taskLabels,
    });

    if (onTask.scheduledFor) {
      setDate(new Date(task.scheduledFor));
    }
  };

  const handleAddLabel = () => {
    if (
      newLabelInput.trim() &&
      !availableLabels.includes(newLabelInput.trim())
    ) {
      const newLabel = newLabelInput.trim();
      setAvailableLabels([...availableLabels, newLabel]);

      // Add the new label to the current task being edited/created
      if (editingTask) {
        setEditedTask({
          ...editedTask,
          labels: [...editedTask.labels, newLabel],
        });
      } else if (isAddingTask) {
        setNewTask({
          ...newTask,
          labels: [...newTask.labels, newLabel],
        });
      }

      setNewLabelInput("");
      setShowLabelInput(false);
    }
  };

  const handleLabelSelection = (label) => {
    console.log("this is from handle label selection", label);

    if (editingTask) {
      setEditedTask((prev) => ({
        ...prev,
        labels: prev.labels.includes(label)
          ? prev.labels.filter((l) => l !== label)
          : [...prev.labels, label],
      }));
    } else if (isAddingTask) {
      setNewTask((prev) => ({
        ...prev,
        labels: prev.labels.includes(label)
          ? prev.labels.filter((l) => l !== label)
          : [...prev.labels, label],
      }));
    }
    setShowLabelsDropdown(false);
  };

  const handleRemoveLabel = (labelToRemove) => {
    if (editingTask) {
      setEditedTask({
        ...editedTask,
        labels: editedTask.labels.filter((label) => label !== labelToRemove),
      });
    } else if (isAddingTask) {
      setNewTask({
        ...newTask,
        labels: newTask.labels.filter((label) => label !== labelToRemove),
      });
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditedTask({
      ...task,
      labels: task.labels.map((label) =>
        typeof label === "object" ? label.name : label
      ),
    });
  };

  const fetchPostDetails = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:8080/get/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // ensure this is set
        },
      });

      const data = await res.json();
      console.log("im fromn details", data);
      setSelectedTask({
        ...data,
        scheduledFor: data.scheduledFor.toISOString(),
        labels: data.labels.map((label) => label?.name || label),
      });
    } catch (err) {
      console.error("Failed to fetch post:", err);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    // First apply the date filter
    let dateFilterPassed = true;
    if (selectedFilter !== "all" && task.scheduledFor) {
      const taskDate = new Date(task.scheduledFor);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const taskDay = new Date(taskDate);
      taskDay.setHours(0, 0, 0, 0);

      switch (selectedFilter) {
        case "today":
          dateFilterPassed = taskDay.getTime() === today.getTime();
          break;
        case "next7":
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          dateFilterPassed = taskDay > today && taskDay <= nextWeek;
          break;
        default:
          break;
      }
    }
    const labelFilterPassed =
      selectedLabelFilter === "all" ||
      (task.labels &&
        task.labels.some((label) => {
          const labelName = typeof label === "object" ? label.name : label;
          return labelName === selectedLabelFilter;
        }));

    return dateFilterPassed && labelFilterPassed;
  });

  // const filteredTasks = selectedLabelFilter === 'all'
  // ? tasks
  // : tasks.filter(task => task.labels?.includes(selectedLabelFilter));
  return (
    <div className="flex h-screen bg-neutral-400">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-900 text-white p-4">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center"></div>
          <div className="ml-2">
            <div className="font-medium">{user}</div>
          </div>
        </div>
        <nav className="space-y-2">
          <div className="flex items-center text-gray-300 p-2  rounded">
            <span>My day</span>
            <Badge className="ml-auto bg-blue-700 text-xs">
              {
                tasks.filter((task) => {
                  if (!task.scheduledFor) return false;
                  const taskDate = new Date(task.scheduledFor);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  taskDate.setHours(0, 0, 0, 0);
                  return taskDate.getTime() === today.getTime();
                }).length
              }
            </Badge>
          </div>
          <div className="flex items-center text-gray-300 p-2  rounded">
            <span>Next 7 days</span>
            <Badge className="ml-auto bg-blue-700 text-xs">
              {
                tasks.filter((task) => {
                  if (!task.scheduledFor) return false;
                  const taskDate = new Date(task.scheduledFor);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const nextWeek = new Date(today);
                  nextWeek.setDate(today.getDate() + 7);
                  taskDate.setHours(0, 0, 0, 0);
                  return taskDate > today && taskDate <= nextWeek;
                }).length
              }
            </Badge>
          </div>
          <div className="flex items-center text-gray-300 p-2  rounded">
            <span>All my tasks</span>
            <Badge className="ml-auto bg-blue-700 text-xs">
              {tasks.length}
            </Badge>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Task List */}
        <div className="w-1/2 p-6">
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <Popover
                open={showLabelsDropdown}
                onOpenChange={setShowLabelsDropdown}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-gray-300 rounded-full text-sm"
                  >
                    Filter by Label <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 bg-gray-800 border-gray-700">
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <div
                      className={`px-3 py-1 text-sm cursor-pointer ${
                        selectedLabelFilter === "all"
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                      onClick={() => {
                        setSelectedLabelFilter("all");
                        setShowLabelsDropdown(false);
                      }}
                    >
                      All
                      {selectedLabelFilter === "all" && (
                        <span className="text-green-400 ml-2">✓</span>
                      )}
                    </div>
                    {availableLabels.map((label) => {
                      const labelName = label?.name || label;
                      return (
                        <div
                          key={labelName}
                          className={`px-3 py-1 text-sm cursor-pointer ${
                            selectedLabelFilter === labelName
                              ? "bg-gray-700 text-white"
                              : "text-gray-300 hover:bg-gray-700"
                          }`}
                          onClick={() => {
                            setSelectedLabelFilter((prev) =>
                              prev === labelName ? "all" : labelName
                            );
                            setShowLabelsDropdown(false);
                          }}
                        >
                          {labelName}
                          {selectedLabelFilter === labelName && (
                            <span className="text-green-400 ml-2">✓</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                    selectedTask?.id === task.id ? "bg-gray-700" : "bg-gray-800"
                  } hover:bg-gray-700`}
                  onClick={() => handleTaskClick(task)}
                >
                  <span className="text-gray-300">{task.title}</span>
                  <div className="flex gap-1">
                    {Array.isArray(task.labels) &&
                      task.labels.map((label, index) => {
                        const labelName = label?.name || label;
                        return (
                          <Badge key={index} className="bg-gray-700 text-xs">
                            {labelName}
                          </Badge>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="bg-gray-900 rounded-lg p-3 cursor-pointer hover:bg-gray-800"
            onClick={handleAddTaskClick}
          >
            <div className="flex items-center text-gray-400">
              <Plus className="mr-2 h-5 w-5" />
              <span>Add task</span>
            </div>
          </div>
        </div>

        {/* Task Details or Add Task Form */}
        <div className="w-1/2 p-6">
          <Card className="bg-gray-900 border-gray-800 h-full">
            <CardHeader className="border-b border-gray-800 pb-4">
              <div className="flex items-center justify-between">
                {isAddingTask ? (
                  <CardTitle className="text-white text-2xl">
                    Add New Task
                  </CardTitle>
                ) : selectedTask ? (
                  <CardTitle className="text-white text-2xl">
                    {editingTask ? "Editing Task" : selectedTask.title}
                  </CardTitle>
                ) : (
                  <CardTitle className="text-white text-2xl text-gray-500">
                    No task selected
                  </CardTitle>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              {isAddingTask ? (
                <form onSubmit={handleSubmit}>
                  <div className="flex gap-2 mb-4">
                    <Popover
                      open={isDatePickerOpen}
                      onOpenChange={setIsDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "bg-gray-800 border-gray-700 text-gray-300 rounded-full text-sm",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="h-4 w-4 mr-1 text-red-500" />
                          {date ? format(date, "PPP") : "Set date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={handleDateSelect}
                          initialFocus
                          className="bg-gray-800 text-white"
                        />
                      </PopoverContent>
                    </Popover>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="bg-gray-800 border-gray-700 text-gray-300 rounded-full text-sm"
                          >
                            {/* <Tag className="h-4 w-4 mr-1 text-blue-500" /> */}
                            Select Labels
                            <ChevronDown className="ml-1 h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2 bg-gray-800 border-gray-700">
                          {console.log(
                            "these are the available labels",
                            availableLabels
                          )}
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {availableLabels.map((label) => (
                              <div
                                key={label}
                                className="px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded cursor-pointer flex justify-between items-center"
                                onClick={() => {
                                  console.log(
                                    "i got clicked to see if it works",
                                    label
                                  );

                                  handleLabelSelection(label);
                                }}
                              >
                                {label}
                                {(isAddingTask
                                  ? newTask.labels
                                  : editedTask?.labels
                                )?.includes(label) && (
                                  <span className="text-green-400 ml-2">✓</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Tags button that shows input field */}
                      {showLabelInput ? (
                        <div className="flex items-center gap-2">
                          <Input
                            className="bg-gray-800 border-gray-700 text-white rounded-full text-sm h-9 px-3 w-32"
                            value={newLabelInput}
                            onChange={(e) => setNewLabelInput(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleAddLabel()
                            }
                            placeholder="New label"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleAddLabel}
                            disabled={!newLabelInput.trim()}
                          >
                            Add
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowLabelInput(false)}
                          >
                            <X className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="bg-gray-800 border-gray-700 text-gray-300 rounded-full text-sm"
                          onClick={() => {
                            setShowLabelInput(true);
                            setShowLabelsDropdown(false);
                          }}
                        >
                          <Tag className="h-4 w-4 mr-1 text-blue-500" />
                          Add Tag
                        </Button>
                      )}

                      {newTask.labels?.map((label, index) => (
                        <Badge
                          key={index}
                          className="bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center"
                        >
                          {label}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => handleRemoveLabel(label)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Title
                    </h3>
                    <Input
                      className="bg-gray-800 border-gray-700 text-white"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      placeholder="Task Title"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Notes
                    </h3>
                    <textarea
                      className="w-full p-2 min-h-32 bg-gray-800 border border-gray-700 rounded text-white"
                      value={newTask.content}
                      onChange={(e) =>
                        setNewTask({ ...newTask, content: e.target.value })
                      }
                      placeholder="Enter task details here..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="w-full bg-blue-800 text-white hover:bg-blue-700"
                    >
                      Add Task
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-700 text-gray-300"
                      onClick={() => setIsAddingTask(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : selectedTask ? (
                <div className="text-white">
                  <div className="flex gap-2 mb-6">
                    <Popover
                      open={isDatePickerOpen}
                      onOpenChange={setIsDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "bg-gray-800 border-gray-700 text-gray-300 rounded-full text-sm",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="h-4 w-4 mr-1 text-red-500" />
                          {editingTask
                            ? format(date, "PPP")
                            : selectedTask.scheduledFor
                            ? formatDate(selectedTask.scheduledFor)
                            : "Set date"}
                          {/* {date ? format(date, "PPP") : "Set date"} */}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={handleDateSelect}
                          initialFocus
                          className="bg-gray-800 text-white"
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="bg-gray-800 border-gray-700 text-gray-300 rounded-full text-sm"
                        >
                          {/* <Tag className="h-4 w-4 mr-1 text-blue-500" /> */}
                          Select Labels
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2 bg-gray-800 border-gray-700">
                        {console.log(
                          "these are the available labels",
                          availableLabels
                        )}
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {availableLabels.map((label) => (
                            <div
                              key={label}
                              className="px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded cursor-pointer flex justify-between items-center"
                              onClick={() => {
                                console.log(
                                  "i got clicked to see if it works",
                                  label
                                );

                                handleLabelSelection(label);
                              }}
                            >
                              {label}
                              {(isAddingTask
                                ? newTask.labels
                                : editedTask?.labels
                              )?.includes(label) && (
                                <span className="text-green-400 ml-2">✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {editingTask ? (
                      <div className="flex items-center gap-2">
                        <Input
                          className="bg-gray-800 border-gray-700 text-white rounded-full text-sm h-9 px-3 w-32"
                          value={newLabelInput}
                          onChange={(e) => setNewLabelInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddLabel()
                          }
                          placeholder="New label"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleAddLabel}
                          disabled={!newLabelInput.trim()}
                        >
                          Add
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowLabelInput(false)}
                        >
                          <X className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {/* Display labels badges */}
                        {console.log(
                          "this is the selected task",
                          selectedTask.labels
                        )}
                        {Array.isArray(selectedTask.labels) &&
                          selectedTask.labels.map((label, index) => (
                            <Badge
                              key={index}
                              className="bg-gray-700 text-gray-300"
                            >
                              {label}
                            </Badge>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Title
                    </h3>
                    {editingTask ? (
                      <Input
                        className="bg-gray-800 border-gray-700 text-white mb-4"
                        value={editedTask.title}
                        onChange={(e) =>
                          setEditedTask({
                            ...editedTask,
                            title: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <div className="text-xl font-semibold mb-4">
                        {selectedTask.title}
                      </div>
                    )}

                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Notes
                    </h3>
                    {editingTask ? (
                      <textarea
                        className="w-full p-2 min-h-32 bg-gray-800 border border-gray-700 rounded text-white"
                        value={editedTask.content}
                        onChange={(e) =>
                          setEditedTask({
                            ...editedTask,
                            content: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <div className="p-3 bg-gray-800 rounded min-h-32 whitespace-pre-wrap">
                        {selectedTask.content || "No notes added to this task."}
                      </div>
                    )}
                  </div>

                  {selectedTask.createdAt && (
                    <div className="text-sm text-gray-500">
                      Created: {formatDate(selectedTask.createdAt)}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    {editingTask ? (
                      <>
                        <Button
                          type="button"
                          className="flex-1 bg-green-600 text-white hover:bg-green-700"
                          onClick={handleUpdateTask}
                        >
                          Save Changes
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 border-gray-700 text-gray-300"
                          onClick={() => setEditingTask(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          className="w-1/2 bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => handleEditTask(selectedTask)}
                        >
                          Edit Task
                        </Button>
                        <Button
                          type="button"
                          className="w-1/2 bg-red-600 text-white hover:bg-red-700"
                          onClick={() => handleDelete(selectedTask.id)}
                        >
                          Delete Task
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <div className="text-6xl mb-4">📋</div>
                  <p>
                    Select a task to view details or click "Add task" to create
                    a new one
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
