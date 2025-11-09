import { addProject, deleteProject, addTodo, deleteTodo, findProjectIndex, editDoneStatus, editTitle, editDate, editPriority, editDescription, sortTodos} from "./todoManager";
import {format} from "date-fns";

function addGlobalEventListener(type, selector, parent = document, callback) {
    parent.addEventListener(type, e => {
        if (e.target.matches(selector)) {
            callback(e);
        }
    })
}

function disableButtons() {
    const disableButtons = document.querySelector("#current div").children;
            for (const button of disableButtons){
                button.disabled = true;
            }
}

function enableButtons() {
    const enableButtons = document.querySelector("#current div").children;
            for (const button of enableButtons){
                button.disabled = false;
            }
}

function updateProjectH2(id, name) {
    const projectH2 = document.querySelector("#current-project");
    projectH2.textContent = name;
    projectH2.dataset.id = id;
}

function loadTodoDisplay(todo, projectId="") {
    const todoLi = document.createElement("li");
    todoLi.classList.add(`${todo.priority}-priority`, "todo");
    todoLi.setAttribute("data-id", todo.id);
    if (!projectId){
        projectId = document.querySelector("#current-project").dataset.id;
    }
    todoLi.setAttribute("data-project-id", projectId);
    
    const checkbox = document.createElement("input")
    checkbox.type = "checkbox";
    todoLi.appendChild(checkbox);
    if (todo.done) {
        checkbox.checked = true;
        todoLi.classList.add("done")
    }

    const title = document.createElement("h3");
    title.textContent = todo.title;
    todoLi.appendChild(title);

    const dueDate = document.createElement("p");
    dueDate.classList.add("due-date")
    dueDate.textContent = format(new Date(todo.dueDate), "dd-MM-yyyy");
    todoLi.appendChild(dueDate);

    const showMore = document.createElement("button");
    const showMoreText = document.createElement("span");

    showMoreText.textContent = "Show todo details";
    showMoreText.classList.add("sr-only");

    showMore.appendChild(showMoreText);
    showMore.classList.add("show-more");
    todoLi.appendChild(showMore);


    const deleteTodo = document.createElement("button");
    const deleteText = document.createElement("span");

    deleteText.classList.add("sr-only");
    deleteText.textContent = "Delete todo";

    deleteTodo.appendChild(deleteText);
    deleteTodo.classList.add("close");
    todoLi.appendChild(deleteTodo);

    const hiddenDiv = document.createElement("div");
    hiddenDiv.classList.add("hidden");
    const btnGroup = document.createElement("div");
    btnGroup.classList.add("btn-group");
    const lowBtn = document.createElement("button");
    lowBtn.value = "low";
    lowBtn.textContent = "Low";
    const medBtn = document.createElement("button");
    medBtn.value = "medium";
    medBtn.textContent = "Medium";
    const hiBtn = document.createElement("button");
    hiBtn.value = "high";
    hiBtn.textContent = "High"
    btnGroup.appendChild(lowBtn);
    btnGroup.appendChild(medBtn);
    btnGroup.appendChild(hiBtn);
    hiddenDiv.appendChild(btnGroup);

    const description = document.createElement("p");
    description.textContent = todo.description;
    description.classList.add("description");
    hiddenDiv.appendChild(description);

    todoLi.appendChild(hiddenDiv);
    todoLi.classList.add("animation-start");

    
    const todosDiv = document.querySelector("#todos-container");
    todosDiv.appendChild(todoLi);

    todosDiv.offsetWidth;

}

//loads the given project, the first one, or disables the buttons if no projects on local storage, changes h2 content and id
function loadProjectDisplay(id="", isInitialSetting=false) {
    const localProjects = JSON.parse(localStorage.getItem("projects"));
    //checks if we're loading a certain project, or just the default one(first one),
    if (!id){
        // if localStorage is empty, disable buttons that would cause issues, modify h2 to let user know there's no 
        if (!localProjects.length) {
            disableButtons();
            updateProjectH2("", "There are no projects")
            return;
        } 
        //loads first project on the list
        else {
            id = localProjects[0].id;
            if (isInitialSetting) {
                for (const project of localProjects){
                    addProjectButton(project.id, project.title);
                }
            }
        }
    }
    enableButtons();
    const projectLoading = localProjects[findProjectIndex(id)];
    updateProjectH2(id, projectLoading.title);

    const sortBySelection = document.querySelector("#sort-by").value;
    const sortedTodos = sortTodos(sortBySelection);

    const todosDiv = document.querySelector("#todos-container");
    todosDiv.textContent = "";

    for (const todo of sortedTodos){
        loadTodoDisplay(todo, id);
    }

    const allTodos = [...document.querySelector("#todos-container").children];

    allTodos.forEach((todo, index) => {
        setTimeout(() => {
            todo.classList.add("animation-finished");
        }, index * 50);
    });
}

function loadSortedDisplay(sortedTodos, sortBy) {
    disableButtons();
    updateProjectH2("", sortBy);

    const todosContainer = document.querySelector("#todos-container");
    todosContainer.textContent = "";

    for (const todo of sortedTodos) {
        loadTodoDisplay(todo.todo, todo.projectId);
    }
    
    const allTodos = [...document.querySelector("#todos-container").children];

    allTodos.forEach((todo, index) => {
        setTimeout(() => {
            todo.classList.add("animation-finished");
        }, index * 50);
    });
}

function addProjectButton(id, name) {
    const projectsDiv = document.querySelector("#project-buttons");
    const btnProject = document.createElement("button");
    btnProject.classList.add("dashboard-button", "project-button", "animation-start");
    btnProject.textContent = name;
    btnProject.setAttribute("data-id", id);
    // append before add project button, might change if we add a scrollable div for projects
    projectsDiv.appendChild(btnProject);
    projectsDiv.offsetWidth;

    btnProject.classList.add("animation-finished");
}



function addShowModalListeners() {
    //Adds listeners to open the 3 modals to delete and add projects and add todos
    const addProjectModal = document.querySelector(".new-project-modal");
    document.querySelector("#add-project").addEventListener("click", () => {
        addProjectModal.showModal();
    });

    const deleteProjectModal = document.querySelector(".delete-project-modal");
    document.querySelector("#delete-project").addEventListener("click", () => {
        deleteProjectModal.showModal();
    });

    const addTodoModal = document.querySelector(".new-todo-modal");
    document.querySelector("#add-todo").addEventListener("click", () => {
        addTodoModal.showModal();
    });
};

function addDashboardListeners() {
    //add sorting all todos buttons
    const sortBtns = document.querySelector("#sort-buttons");
    addGlobalEventListener("click", ".sort-button", sortBtns, (e) => {
        const sortedTodos = sortTodos(e.target.value);
        
        if (sortedTodos){
            loadSortedDisplay(sortedTodos, e.target.textContent);
        }
    })

    // add current project listener
    const projectsDiv = document.querySelector("#project-buttons");
    addGlobalEventListener("click", ".project-button", projectsDiv, (e) => {
        const currentProjectId = document.querySelector("#current h2").dataset.id;
        if (e.target.dataset.id !== currentProjectId){
            loadProjectDisplay(e.target.dataset.id);
        }
    })
}

function addModalListeners() {

    //add todo modal submit listener
    const todoForm = document.querySelector(".new-todo-form");
    const todoModal = document.querySelector(".new-todo-modal");
    todoForm.addEventListener("submit", (event) =>{
        event.preventDefault();
        const todoData = new FormData(todoForm);

        for (const input of todoData.entries()) {
            if (input[0] !== "description" && !input[1]){
                    alert(`You must enter a value in the ${input[0]} field`);
                    return;
            }
        }
        const todoObject = Object.fromEntries(todoData.entries());
        const currentProjectId = document.querySelector("#current-project").dataset.id;
        addTodo(todoObject, currentProjectId);

        loadProjectDisplay(currentProjectId);

        todoModal.close();
    });
    todoModal.addEventListener("close", () => {
        todoForm.reset();
    })

    //add project modal button listener
    const addProjectModal = document.querySelector(".new-project-modal")
    document.querySelector("#submit-project").addEventListener("click", () => {
        const nameInput = document.querySelector("#name");
        
        if (nameInput.value) {
            const addProjectId = addProject(nameInput.value);

            addProjectButton(addProjectId, nameInput.value);

            loadProjectDisplay(addProjectId);

            addProjectModal.close();
        }
    });
    addProjectModal.addEventListener("close", () => {
        const nameInput = document.querySelector("#name");
        nameInput.value = "";
    })

    //add delete project listeners
    const deleteProjectModal = document.querySelector(".delete-project-modal");
    addGlobalEventListener("click", "button", deleteProjectModal, (e) => {
        if (e.target.textContent === "Yes") {
        
            const deleteProjectId = document.querySelector("#current-project").dataset.id;
            deleteProject(deleteProjectId);

            const buttonRemove = document.querySelector(`.project-button[data-id="${deleteProjectId}"]`);
            buttonRemove.remove()
            loadProjectDisplay();
            deleteProjectModal.close();

        } else {
            deleteProjectModal.close();
        }
    });
}

function addSortProjectListener() {
    const sortSelect = document.querySelector("#sort-by");
    sortSelect.addEventListener("change", (e) => {
        const currentProjectId = document.querySelector("#current-project").dataset.id;
        
        loadProjectDisplay(currentProjectId)
    })
}

function addTodoListeners() {
    //add listener on checkbox to change todo done state
    const todosContainer = document.querySelector("#todos-container");
    //checkbox
    addGlobalEventListener("change", "input[type='checkbox']", todosContainer, (e) =>{
        const todo = e.target.parentElement;

        todo.classList.toggle("done");
        editDoneStatus(todo.dataset.projectId, todo.dataset.id);
    })
    //delete todo
    addGlobalEventListener("click", ".close", todosContainer, (e) =>{
        const todo = e.target.parentElement;
        todo.classList.add("animation-exit");
        deleteTodo(todo.dataset.projectId, todo.dataset.id)
        setTimeout(() =>{todo.remove()}, 300);
    })
    //expand div
    addGlobalEventListener("click", ".show-more", todosContainer, (e) =>{
        const hiddenDiv = e.target.parentElement.querySelector(".hidden");
        const showButton = e.target
        showButton.classList.toggle("show-less")
        hiddenDiv.classList.toggle("visible");
    })

    //live title editing
    addGlobalEventListener("click", "h3", todosContainer, (e) => {
        const todoTitle = e.target;
        const todo = e.target.parentElement;
        const todoInput = document.createElement("input");
        todoInput.type = "text";
        todoInput.value = todoTitle.textContent;
        todoInput.classList.add("title-input");

        todoTitle.replaceWith(todoInput);
        todoInput.focus();

        todoInput.addEventListener("blur", (e) => {
            saveTitle();
            editTitle(todo.dataset.projectId, todo.dataset.id, e.target.value);
        });

        todoInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter"){
                saveTitle();
                editTitle(todo.dataset.projectId, todo.dataset.id, e.target.value);
            }
        })

        function saveTitle() {
            const editedTitle = document.createElement("h3");
            editedTitle.textContent = todoInput.value.trim() || "Untitled";
            const replaceInput = document.querySelector(".title-input");
            setTimeout(() => {
                replaceInput.replaceWith(editedTitle);
            }, 0);
        }
    })

    //live date editing
    addGlobalEventListener("click", "li > p", todosContainer, (e) => {
        const todoDate = e.target;
        const todo = e.target.parentElement
        const todoInput = document.createElement("input");
        todoInput.type = "date";
        todoInput.classList.add("date-input");

        todoDate.replaceWith(todoInput);
        todoInput.focus();

        todoInput.addEventListener("blur", (e) => {
            saveDate();
            editDate(todo.dataset.idProject, todo.dataset.id, e.value)
        });
        todoInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter"){
                e.preventDefault();
                saveDate();
                editDate(todo.dataset.idProject, todo.dataset.id, e.value)
            }
        })

        function saveDate() {
            const editedDate = document.createElement("p");
            const date = todoInput.value ? todoInput.value : new Date();
            editedDate.classList.add("due-date");
            editedDate.textContent = format(new Date(date), "dd-MM-yyyy"); 
            const replaceInput = document.querySelector(".date-input");
            setTimeout(() => {
                replaceInput.replaceWith(editedDate);
            }, 0);
        }
    })
    //priority buttons
    addGlobalEventListener("click", ".btn-group > button", todosContainer, (e) => {
        if (e.target.value === "high" || e.target.value === "medium" || e.target.value === "low") {
            const todo = e.target.closest("li");
            editPriority (todo.dataset.idProject, todo.dataset.id, e.target.value);

            todo.className = "";
            todo.classList.add(`${e.target.value}-priority`, "todo") ;
        }
    })
    //live description editing
    addGlobalEventListener("click", ".hidden p", todosContainer, (e) => {
        const todoDescription = e.target;
        const todo = e.target.closest("li");
        const todoTextarea = document.createElement("textarea");
        todoTextarea.classList.add("description-input");
        todoTextarea.value = todoDescription.textContent;

        todoDescription.replaceWith(todoTextarea);
        todoTextarea.focus();

        todoTextarea.addEventListener("blur", (e) => {
            saveDescription(); 
            editDescription(todo.dataset.idProject, todo.dataset.id, e.target.value);
        })

        todoTextarea.addEventListener("keydown", (e) => {
            if (e.key === "Enter"){
                saveDescription(); 
                editDescription(todo.dataset.idProject, todo.dataset.id, e.target.value);
            }
        })

        function saveDescription() {
            const editedDescription = document.createElement("p");
            editedDescription.classList.add("description");
            editedDescription.textContent = todoTextarea.value.trim() || "";
            const replaceInput = document.querySelector(".description-input");
            setTimeout(() => {
                replaceInput.replaceWith(editedDescription);
            }, 0);
        }
    })
    
}


function setInitialListeners() {
    addModalListeners();
    addShowModalListeners();
    addDashboardListeners();
    addSortProjectListener();
    addTodoListeners();
}



export {setInitialListeners, loadProjectDisplay};
