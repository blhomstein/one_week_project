import React, { useState, useEffect, use } from 'react';
import axios from "axios"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TaskManager = () => {
  const [tasks, setTasks] = useState([
   
  ]);
  const [tasking, setTasking] = useState([{
    title: "",
    content: "",
    scheduledFor: "",
    labels: "",
    attachement: "",
  }]);
 const[selectedTask, setSelectedTask] = useState(null)
let response

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/get/9");
      console.log(response.data); // Log the actual data
      setTasks(response.data)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  fetchData(); // Call the async function
}, []); 

const handleSubmit = async (e)=>{
  e.preventDefault()
  await axios.post("http://localhost:8080/post", {
    ...tasking, published: true, scheduledFor: new Date().toISOString()
  })
}


  // Simple date formatter without date-fns
  const formatDate = (date) => {
    if (!date) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };
  // console.log(response);
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

        <div className="mt-6 mb-2 flex items-center justify-between">
          <div className="flex items-center text-gray-300">
            <span>My lists</span>
            <span className="ml-2">🔒</span>
          </div>
          <Button variant="ghost" className="p-0 h-6 w-6">
            <Plus className="h-4 w-4 text-gray-300" />
          </Button>
        </div>

        <nav className="space-y-1">
          <div className="flex items-center text-gray-300 p-2 bg-blue-800 rounded">
            <span>Personal</span>
            <Badge className="ml-auto bg-blue-700 text-xs">2</Badge>
          </div>
          <div className="flex items-center text-gray-300 p-2 hover:bg-blue-800 rounded">
            <span>Work</span>
          </div>
          <div className="flex items-center text-gray-300 p-2 hover:bg-blue-800 rounded">
            <span>Grocery List</span>
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
              <div className="flex">
                <Button variant="ghost" className="text-gray-400">
                  <span className="mr-2">Share</span>
                </Button>
                <Button variant="ghost" className="text-gray-400">
                  <span className="mr-2">View</span>
                </Button>
                <Button variant="ghost" className="text-gray-400">
                  ...
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`flex items-center p-3 rounded-lg ${selectedTask.id === task.id ? 'bg-gray-800' : 'bg-gray-800'}`}
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
                {selectedTask? (
                <CardTitle className="text-white text-2xl">{selectedTask.title}</CardTitle>) : (
                  <CardTitle className="text-white text-2xl text-gray-500">No task selected</CardTitle>

                )
              }
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-full h-8 w-8 p-0 border-gray-700">
                    <span className="sr-only">Toggle task</span>
                    <div className="w-4 h-4 rounded-full border-2 border-blue-500"></div>
                  </Button>
                  <Button variant="outline" className="rounded-full h-8 w-8 p-0 border-gray-700">
                    <span className="sr-only">More options</span>
                    <span className="h-4 w-4 text-gray-400">...</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
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
                <h3 className="text-sm font-medium text-gray-500 mb-2">NOTES</h3>
                <div className="min-h-20 text-gray-400">
                  Insert your notes here
                </div>
              </div>
{/* 
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">SUBTASKS 0/0</h3>
                  <Button variant="ghost" className="h-6 w-6 p-0">
                    <span className="sr-only">More options</span>
                    <span className="h-4 w-4 text-gray-500">...</span>
                  </Button>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full border border-gray-600 mr-2"></div>
                  <Input 
                    placeholder="Add a new subtask" 
                    className="bg-transparent border-none text-gray-400 p-0 h-8 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newSubtask.trim()) {
                        setSubtasks([...subtasks, { id: Date.now(), text: newSubtask, completed: false }]);
                        setNewSubtask('');
                      }
                    }}
                  />
                </div>
              </div> */}

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">ATTACHMENTS</h3>
                <div className="border border-dashed border-gray-700 rounded-lg p-8 flex items-center justify-center text-gray-500 text-sm">
                  Click to add / drop your files here
                </div>
              </div>
              
              {/* Date picker popover without requiring Calendar component
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">SCHEDULE</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="bg-gray-800 border-gray-700 text-gray-300 rounded-full text-sm">
                      <span className="text-blue-500 mr-1">📅</span>
                      {selectedDate ? formatDate(selectedDate) : "Set date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4 bg-gray-800 border-gray-700">
                    <div className="grid gap-2">
                      <Button 
                        variant="outline" 
                        className="justify-start" 
                        onClick={() => {
                          const today = new Date();
                          setSelectedDate(today);
                        }}
                      >
                        Today
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          setSelectedDate(tomorrow);
                        }}
                      >
                        Tomorrow
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => {
                          const nextWeek = new Date();
                          nextWeek.setDate(nextWeek.getDate() + 7);
                          setSelectedDate(nextWeek);
                        }}
                      >
                        Next week
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => setSelectedDate(null)}
                      >
                        No date
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;