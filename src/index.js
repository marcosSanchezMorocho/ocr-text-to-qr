import "./style.css";
import {setInitialListeners, loadProjectDisplay} from "./displayController.js";
import {Project, addProject, deleteProject, addTodo} from "./todoManager.js";

if (!localStorage.getItem("projects")) {
    //Set the projects array with demo myTasks project
    localStorage.setItem("projects", JSON.stringify([new Project("My Tasks")]));
} else {
    //TODO: load the project on the content div witht its todos

}


setInitialListeners();
loadProjectDisplay("", true);


