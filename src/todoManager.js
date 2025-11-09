import { isAfter, isThisISOWeek, isToday } from "date-fns";

const projects = [];

class Todo {
    constructor(title, description="", dueDate, priority, done=false){
        this.id = crypto.randomUUID();
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.done = done;
    }
}

class Project {
    constructor(title){
        this.id = crypto.randomUUID();
        this.title = title;
        this.todos = []
    }
}

class sortTodo {
    constructor(todo, projectId){
        this.todo = todo;
        this.projectId = projectId;
    }
}

//find index of a given project, id can be passed onto it, or it can retrieve it from the h2
function findProjectIndex(id="") {
    if (!id) {
        id = document.querySelector("#current-project").dataset.id;
    }
    return JSON.parse(localStorage.getItem("projects")).findIndex(p => p.id === id);
}

function findTodoIndex(id, projectIndex) {
    if (!projectIndex) {
        const projectId = document.querySelector("#current-project").dataset.id;
        findProjectIndex(projectId);
    }
    return JSON.parse(localStorage.getItem("projects"))[projectIndex].todos.findIndex(p => p.id === id);
}

function addProject(name) {
    const localProjects = JSON.parse(localStorage.getItem("projects"));
    const newProject = new Project(name);

    localProjects.push(newProject);
    localStorage.setItem("projects", JSON.stringify(localProjects));

    return newProject.id;
}

function deleteProject(id) {
    const localProjects = JSON.parse(localStorage.getItem("projects"));

    const deleteIndex = findProjectIndex();

    if (deleteIndex !== -1) {
        localProjects.splice(deleteIndex, 1);
        localStorage.setItem("projects", JSON.stringify(localProjects));  
    } else {
        alert(`Project with id ${id} not found.`);
    }

}

function addTodo(data) {
    const localProjects = JSON.parse(localStorage.getItem("projects"));
    if (!["high", "medium", "low"].includes(data.priority)){
        data.priority = "medium";
    }
    const newTodo = new Todo(data.title, data.description, new Date(data.dueDate), data.priority);


    localProjects[findProjectIndex()].todos.push(newTodo);
    localStorage.setItem("projects", JSON.stringify(localProjects));

    return newTodo.id;
}

function deleteTodo(projectId = "", id) {
    const localProjects = JSON.parse(localStorage.getItem("projects"));
    const projectIndex = findProjectIndex(projectId);

    localProjects[projectIndex].todos.splice([findTodoIndex(id, projectIndex)], 1)
    localStorage.setItem("projects", JSON.stringify(localProjects));
}

function editDoneStatus(projectId = "", id) {
    const localProjects = JSON.parse(localStorage.getItem("projects"));

    const projectIndex = findProjectIndex(projectId);
    const todoIndex = findTodoIndex(id, projectIndex);

    const doneState = localProjects[projectIndex].todos[todoIndex].done;
    localProjects[projectIndex].todos[todoIndex].done = !doneState;
    localStorage.setItem("projects", JSON.stringify(localProjects));
}

function editTitle( projectId = "", id, editedTitle) {
    const localProjects = JSON.parse(localStorage.getItem("projects"));
    const projectIndex = findProjectIndex(projectId);

    localProjects[projectIndex].todos[findTodoIndex(id, projectIndex)].title = editedTitle.trim() || "Untitled";
    localStorage.setItem("projects", JSON.stringify(localProjects));
}

function editDate(projectId = "", id, editedDate) {
    const localProjects = JSON.parse(localStorage.getItem("projects"));
    const projectIndex = findProjectIndex(projectId);

    if (!editedDate) {
        editedDate = new Date();
    }

    localProjects[projectIndex].todos[findTodoIndex(id, projectIndex)].dueDate = new Date(editedDate);
    localStorage.setItem("projects", JSON.stringify(localProjects));
}

function editPriority(projectId = "", id, editedPriority) {
    const localProjects = JSON.parse(localStorage.getItem("projects"));
    const projectIndex = findProjectIndex(projectId);


    localProjects[projectIndex].todos[findTodoIndex(id, projectIndex)].priority = editedPriority;
    localStorage.setItem("projects", JSON.stringify(localProjects));
}

function editDescription(projectId = "", id, editedDescription) {
    const localProjects = JSON.parse(localStorage.getItem("projects"));
    const projectIndex = findProjectIndex(projectId);

    
    localProjects[projectIndex].todos[findTodoIndex(id, projectIndex)].description = editedDescription.trim() || "";
    localStorage.setItem("projects", JSON.stringify(localProjects));
}

function getAllTodos() {
    const localProjects = JSON.parse(localStorage.getItem("projects"));
    const allTodos = []

    if (localProjects.length) {
        for (const project of localProjects){
            for (const todo of project.todos) {
                allTodos.push(new sortTodo(todo, project.id))
            }
        }
    }

    return allTodos[0] ? allTodos : "";
}

function sortTodos(sortBy) {
    
    if(["all-todos", "today-todos", "week-todos", "priority-todos"].includes(sortBy)){
        const unsortedTodos = getAllTodos();
        if (unsortedTodos){
            switch (sortBy) {
                case "all-todos":
                    return unsortedTodos;
                
                case "today-todos":
                    return unsortedTodos.filter((todo) => isToday(new Date(todo.todo.dueDate)));
                    
                case "week-todos":
                    const weekTodos = unsortedTodos.filter((todo) => isThisISOWeek(new Date(todo.todo.dueDate)));
                    weekTodos.sort((a,b) => isAfter(a.todo.dueDate, b.todo.dueDate) ? 1 : -1);
                    return weekTodos;
                    
                case "priority-todos":
                    return unsortedTodos.filter((todo) => todo.todo.priority === "high");
                
                default:
                    return unsortedTodos;
            }
        }
        else {
            return false;
        }
    } 
    else {
        const projectIndex = findProjectIndex()
        if (projectIndex !== undefined && projectIndex !== null){
            const unsortedTodos = JSON.parse(localStorage.getItem("projects"))[projectIndex].todos;

            switch (sortBy) {
                case "default":
                    return unsortedTodos

                case "desc-priority":
                    return unsortedTodos.sort((a, b) => {
                        return getPriorityValue(b.priority) - getPriorityValue(a.priority);
                      });

                case "asc-priority":
                    return unsortedTodos.sort((a,b) => {
                        return getPriorityValue(a.priority) - getPriorityValue(b.priority);
                    })

                case "desc-duedate": 
                    return unsortedTodos.sort((a,b) => isAfter(a.dueDate, b.dueDate) ? 1 : -1); 

                case "asc-duedate":
                    return unsortedTodos.sort((a,b) => isAfter(a.dueDate, b.dueDate) ? -1 : 1); 
            
                default:
                    return unsortedTodos
            }
        }
        else {
            return false;
        }
    }
    
    
    function getPriorityValue(priority) {
        switch (priority.toLowerCase()) {
            case "high": return 3;
            case "medium": return 2;
            case "low": return 1;
            default: return 0; // For any unexpected values
        }
        }
}

export { Project, addProject, deleteProject, addTodo, deleteTodo, findProjectIndex, editDoneStatus, editTitle, editDate, editPriority, editDescription, sortTodos};