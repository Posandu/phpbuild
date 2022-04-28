import Swal from "sweetalert2";

const $ = (el) => document.querySelector(el);

const updateTodos = () => {
	fetch("api.php?getTodos")
		.then((res) => res.json())
		.then((data) => {
			const todos = data.todos;
			const todoList = $("#todos");

			todoList.innerHTML = todos.length ? "" : "<h4>No todos found</h4>";

			todos.forEach((todo) => {
				const todoEl = document.createElement("div");
				todoEl.classList.add("todo");

				todoEl.innerHTML = `
					<p>${todo.title}</p> ${+todo.done ? "<span>Done</span>" : ""}
					<button class="delete" data-id="${todo.id}">Delete</button>
					<button class="edit" data-id="${todo.id}">Edit</button>
				`;

				todoEl.querySelector(".delete").onclick = () => {
					deleteTodo(todo.id);
				};

				todoEl.querySelector(".edit").onclick = () => {
					editTodo(todo.id);
				};

				todoList.appendChild(todoEl);
			});
		});
};

const deleteTodo = (id) => {
	Swal.fire({
		title: "Are you sure?",
		text: "You won't be able to revert this!",
		icon: "warning",
		showCancelButton: true,
		confirmButtonColor: "#3085d6",
		cancelButtonColor: "#d33",
		confirmButtonText: "Yes, delete it!",
	}).then((result) => {
		if (result.value) {
			fetch(`api.php?deleteTodo&id=${id}`)
				.then((res) => res.json())
				.then((data) => {
					if (data.success) {
						Swal.fire("Deleted!", "Your todo has been deleted.", "success");
					}
					updateTodos();
				});
		}
	});
};

const editTodo = (id) => {
	fetch(`api.php?getTodo&id=${id}`)
		.then((res) => res.json())
		.then((data) => {
			const todo = data.todo;

			Swal.fire({
				title: "Edit todo",
				input: "text",
				inputValue: todo.title,
				showCancelButton: true,
				confirmButtonText: "Save",
				showLoaderOnConfirm: true,
				preConfirm: async (title) => {
					const res = await fetch(
						`api.php?updateTodo&id=${id}&title=${title}&done=${
							prompt("Done?") ? 1 : 0
						}`
					);
					const data = await res.json();
					if (data.success) {
						Swal.fire("Saved!", "Your todo has been saved.", "success");
						updateTodos();
					}
				},
			});
		});
};

updateTodos();

$("#add").onclick = () => {
	let todo = $("#title").value;

	fetch("api.php?addTodo&title=" + todo)
		.then((res) => res.json())
		.then((data) => {
			Swal.fire({
				title: "Success",
				text: "Todo added successfully",
				icon: "success",
			});
			updateTodos();
		})
		.catch((err) => {
			Swal.fire({
				title: "Error",
				text: "Something went wrong",
				icon: "error",
			});
		});
};
