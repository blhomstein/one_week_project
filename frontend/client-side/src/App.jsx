import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [tasking, setTasking] = useState({
    title: "",
    content: "",
    scheduledFor: "",
    labels: "",
    attachement: "",
  });
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch tasks from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/getAll");
        console.log(response.data.blogs);
        
        setTasks(response.data.blogs);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Handle task submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/post", {
        ...tasking,
        published: true,
        scheduledFor: new Date().toISOString(),
      });
      setTasking({
        title: "",
        content: "",
        scheduledFor: "",
        labels: "",
        attachement: "",
      });
    } catch (error) {
      console.error("Error submitting task:", error);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex h-screen bg-neutral-400">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-900 text-white p-4">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center">
            <span className="text-xl">m</span>
          </div>
          <div className="ml-2">
            <div className="font-medium">mehdi</div>
          </div>
        </div>
        <nav className="space-y-2">
          <div className="flex items-center text-gray-300 p-2 hover:bg-blue-800 rounded">
            <span className="mr-2">◯</span>
            <span>My day</span>
            <Badge className="ml-auto bg-blue-700 text-xs">1</Badge>
          </div>
          <div className="flex items-center text-gray-300 p-2 hover:bg-blue-800 rounded">
            <span className="mr-2">◯</span>
            <span>Next 7 days</span>
            <Badge className="ml-auto bg-blue-700 text-xs">2</Badge>
          </div>
          <div className="flex items-center text-gray-300 p-2 hover:bg-blue-800 rounded">
            <span className="mr-2">◯</span>
            <span>All my tasks</span>
            <Badge className="ml-auto bg-blue-700 text-xs">2</Badge>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Task List */}
        <div className="w-1/2 p-6">
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" className="bg-black text-white border-gray-700 px-4">
                Personal
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center p-3 rounded-lg ${selectedTask?.id === task.id ? 'bg-gray-800' : 'bg-gray-800'}`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="w-6 h-6 rounded-full border border-gray-600 mr-3"></div>
                  <span className="text-gray-300">{task.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center text-gray-400">
              <Plus className="mr-2 h-5 w-5" />
              <span>Add task</span>
            </div>
          </div>
        </div>

        {/* Task Details */}
        <div className="w-1/2 p-6">
          <Card className="bg-gray-900 border-gray-800 h-full">
            <CardHeader className="border-b border-gray-800 pb-4">
              <div className="flex items-center text-sm text-gray-400 mb-3">
                <span>My lists</span>
                <span className="mx-2">&gt;</span>
                <span>Personal</span>
              </div>
              <div className="flex items-center justify-between">
                {selectedTask ? (
                  <CardTitle className="text-white text-2xl">{selectedTask.title}</CardTitle>
                ) : (
                  <CardTitle className="text-white text-2xl text-gray-500">No task selected</CardTitle>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <form onSubmit={handleSubmit}>
                <div className="flex gap-2">
                  <Button variant="outline" className="bg-gray-800 border-gray-700 text-gray-300 rounded-full text-sm">
                    <span className="text-red-500 mr-1">⏰</span>
                    Remind me
                  </Button>
                  <Button variant="outline" className="bg-gray-800 border-gray-700 text-gray-300 rounded-full text-sm">
                    <span className="text-yellow-500 mr-1">📝</span>
                    Personal
                  </Button>
                  <Button variant="outline" className="bg-gray-800 border-gray-700 text-gray-300 rounded-full text-sm">
                    <span className="text-blue-500 mr-1">#</span>
                    Tags
                  </Button>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Title</h3>
                  <Input
                    className="bg-transparent text-gray-400"
                    value={tasking.title}
                    onChange={(e) => setTasking({ ...tasking, title: e.target.value })}
                    placeholder="Task Title"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                  <div className="min-h-20 text-gray-400">
                    <Input
                      className="bg-transparent text-gray-400"
                      value={tasking.content}
                      onChange={(e) => setTasking({ ...tasking, content: e.target.value })}
                      placeholder="Task content"
                    />
                  </div>
                </div>

                <div>
                  <Button type="submit" className="mt-4 w-full bg-blue-800 text-white">
                    Add Task
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
