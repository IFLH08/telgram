import React, { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import NewItem from './NewItem';
import API_LIST from './API';
import DashboardPage from './dashboard/DashboardPage';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, CircularProgress, TableBody } from '@mui/material';
import Moment from 'react-moment';

function AppNavigation() {
  return (
    <nav className="app-nav" aria-label="Main navigation">
      <NavLink className="app-nav-link" to="/">
        Tasks
      </NavLink>
      <NavLink className="app-nav-link" to="/dashboard">
        Dashboard
      </NavLink>
    </nav>
  );
}

function TodoPage() {
  const [isLoading, setLoading] = useState(false);
  const [isInserting, setInserting] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState();

  function deleteItem(deleteId) {
    fetch(`${API_LIST}/${deleteId}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          return response;
        }
        throw new Error('Something went wrong ...');
      })
      .then(
        () => {
          const remainingItems = items.filter((item) => item.id !== deleteId);
          setItems(remainingItems);
        },
        (deleteError) => {
          setError(deleteError);
        }
      );
  }

  function reloadOneItem(id) {
    fetch(`${API_LIST}/${id}`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Something went wrong ...');
      })
      .then(
        (result) => {
          const updatedItems = items.map((item) => (
            item.id === id
              ? {
                  ...item,
                  description: result.description,
                  done: result.done,
                }
              : item
          ));
          setItems(updatedItems);
        },
        (reloadError) => {
          setError(reloadError);
        }
      );
  }

  function modifyItem(id, description, done) {
    const data = { description, done };

    return fetch(`${API_LIST}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.ok) {
        return response;
      }
      throw new Error('Something went wrong ...');
    });
  }

  function toggleDone(event, id, description, done) {
    event.preventDefault();
    modifyItem(id, description, done).then(
      () => {
        reloadOneItem(id);
      },
      (toggleError) => {
        setError(toggleError);
      }
    );
  }

  useEffect(() => {
    setLoading(true);

    fetch(API_LIST)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Something went wrong ...');
      })
      .then(
        (result) => {
          setLoading(false);
          setItems(result);
        },
        (loadError) => {
          setLoading(false);
          setError(loadError);
        }
      );
  }, []);

  function addItem(text) {
    setInserting(true);

    fetch(API_LIST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description: text }),
    })
      .then((response) => {
        if (response.ok) {
          return response;
        }
        throw new Error('Something went wrong ...');
      })
      .then(
        (result) => {
          const id = result.headers.get('location');
          const newItem = { id, description: text };
          setItems([newItem, ...items]);
          setInserting(false);
        },
        (insertError) => {
          setInserting(false);
          setError(insertError);
        }
      );
  }

  return (
    <div className="App">
      <AppNavigation />
      <h1>MY TODO LIST</h1>
      <div className="youtube-section">
        <h2>Video de YouTube</h2>
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <NewItem addItem={addItem} isInserting={isInserting} />
      {error && <p>Error: {error.message}</p>}
      {isLoading && <CircularProgress />}
      {!isLoading && (
        <div id="maincontent">
          <table id="itemlistNotDone" className="itemlist">
            <TableBody>
              {items.map((item) => (
                !item.done && (
                  <tr key={item.id}>
                    <td className="description">{item.description}</td>
                    <td className="date">
                      <Moment format="MMM Do hh:mm:ss">{item.createdAt}</Moment>
                    </td>
                    <td>
                      <Button
                        variant="contained"
                        className="DoneButton"
                        onClick={(event) => toggleDone(event, item.id, item.description, !item.done)}
                        size="small"
                      >
                        Done
                      </Button>
                    </td>
                  </tr>
                )
              ))}
            </TableBody>
          </table>
          <h2 id="donelist">Done items</h2>
          <table id="itemlistDone" className="itemlist">
            <TableBody>
              {items.map((item) => (
                item.done && (
                  <tr key={item.id}>
                    <td className="description">{item.description}</td>
                    <td className="date">
                      <Moment format="MMM Do hh:mm:ss">{item.createdAt}</Moment>
                    </td>
                    <td>
                      <Button
                        variant="contained"
                        className="DoneButton"
                        onClick={(event) => toggleDone(event, item.id, item.description, !item.done)}
                        size="small"
                      >
                        Undo
                      </Button>
                    </td>
                    <td>
                      <Button
                        startIcon={<DeleteIcon />}
                        variant="contained"
                        className="DeleteButton"
                        onClick={() => deleteItem(item.id)}
                        size="small"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                )
              ))}
            </TableBody>
          </table>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TodoPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
