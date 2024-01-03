import { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useTodos } from '../../context/todoProvider';
import { addTodo, toggleStatus } from '../../api/todos';
import { USER_ID } from '../../utils/userID';
import { ErrorType } from '../../types/Error';
import { Todo } from '../../types/Todo';

export const TodoForm = () => {
  const {
    taskName, setTaskName, error, setError, isAddingTask,
    setIsAddingTask, setTempTodo, isEdited,
    todos, setTodos, setTogglingId, inputEditRef,
  } = useTodos();

  const isActiveBtnComplededAll = todos.every(task => task.completed);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputEditRef.current?.focus();

    if (!isEdited) {
      inputRef.current?.focus();
    }
  }, [todos, error]);

  const handleInputClick = () => {
    if (isEdited) {
      inputEditRef.current.focus();
      setError(ErrorType.update);
    }

    inputRef.current?.focus();
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (taskName.trim().length === 0) {
      setError(ErrorType.title);

      return;
    }

    setIsAddingTask(true);
    setTempTodo({
      id: 0,
      userId: USER_ID,
      title: taskName.trim(),
      completed: false,
    });

    addTodo({
      userId: USER_ID,
      title: taskName.trim(),
      completed: false,
    })
      .then((newTask: Todo) => {
        const newTodo = [...todos, newTask];

        setTodos(newTodo);
        setTaskName('');
      })
      .catch(() => {
        inputRef.current?.focus();
        setError(ErrorType.add);
      })
      .finally(() => {
        setIsAddingTask(false);
        setTempTodo(null);
      });
  };

  const completeAllTasks = () => {
    setError(null);
    const updatedTasks = todos.map(todo => ({
      ...todo,
      completed: !isActiveBtnComplededAll,
    }));

    // const taskToToggle = todos
    //   .filter(todo => todo.completed !== isActiveBtnComplededAll);

    todos.forEach(task => {
      if (task.completed === isActiveBtnComplededAll) {
        return setTogglingId((current: number[]) => {
          return [...current, task.id];
        });
      }

      return task;
    });

    Promise.all(
      // eslint-disable-next-line array-callback-return
      updatedTasks.map(task => {
        if (task.completed !== isActiveBtnComplededAll) {
          toggleStatus(task.id, {
            completed: task.completed,
          })
            .catch(() => setError(ErrorType.update));
        }
      }),
    )
      .then(() => setTodos(updatedTasks))
      .catch(() => setError(ErrorType.update))
      .finally(() => setTogglingId([]));

    // Promise.allSettled(
    //   updatedTasks.map(task => toggleStatus(task.id, {
    //     completed: task.completed,
    //   })
    //     .then(data => data)
    //     .catch(() => setError(ErrorType.update))),
    // )
    //   .then(() => setTodos(updatedTasks))
    //   .catch(() => setError(ErrorType.update))
    //   .finally(() => setTogglingId([]));
  };

  // const completeAllTasks = () => {
  //   const uncompletedTasks = todos.filter(task => !task.completed);

  //   const completedTodos = todos.map(task => ({ ...task, completed: true }));

  //   uncompletedTasks.forEach(task => {
  //     const currentTogglingId = [...togglingId, task.id];

  //     setTogglingId(currentTogglingId);
  //   });

  //   Promise.allSettled(uncompletedTasks
  //     .map(task => toggleStatus(task.id, { completed: !task.completed })
  //       .catch(() => setError(ErrorType.update))))
  //     .catch(() => setError(ErrorType.update))
  //     .finally(() => {
  //       setTodos(completedTodos);
  //       setTogglingId([]);
  //     });
  // };

  return (
    <header className="todoapp__header">
      {todos.length > 0 && (
        // eslint-disable-next-line jsx-a11y/control-has-associated-label
        <button
          type="button"
          className={classNames('todoapp__toggle-all', {
            active: isActiveBtnComplededAll,
          })}
          data-cy="ToggleAllButton"
          onClick={completeAllTasks}
        />
      )}
      {/* Add a todo on form submit */}
      <form onSubmit={handleOnSubmit}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={taskName}
          onChange={event => setTaskName(event.target.value)}
          onClick={handleInputClick}
          ref={inputRef}
          disabled={isAddingTask}
        />
      </form>
    </header>

  );
};
