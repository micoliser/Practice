import { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import UpdateForm from '../components/UpdateForm';
import DisplayTable from '../components/DisplayTable';
import Input from '../components/Input';
import Button from '../components/Button';
import LoadingPage from '../components/Loading';
import '../styles/manage.css';

function StudentManager({ loading }) {
  // auth context values
  const { isLoggedIn, user } = useContext(AuthContext);

  // states for initial students and department render
  const [allStudents, setAllStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [numberShown, setNumberShown] = useState(100);

  // states for students search functionality
  const [searching, setSearching] = useState(false);
  const [searchingValue, setSearchingValue] = useState('');
  const [searchedValue, setSearchedValue] = useState('');

  // states for students filter functionality
  const [filteringLevel, setFilteringLevel] = useState({
    active: false,
    value: '',
  });
  const [filteringDepartment, setFilteringDepartment] = useState({
    active: false,
    value: '',
  });

  // states for student update functionality
  const [updating, setUpdating] = useState(false);
  const [updateStudent, setUpdateStudent] = useState({ id: '', name: '' });

  // states for search error
  const [searchError, setSearchError] = useState({ active: false });

  useEffect(() => {
    // fetch all students
    axios
      .get('http://localhost:5000/api/students', { withCredentials: true })
      .then((res) => {
        setAllStudents(res.data);
      })
      .catch((err) => {
        console.log('Error:', err);
      });

    // fetch all departments
    axios
      .get('http://localhost:5000/api/departments', { withCredentials: true })
      .then((res) => {
        setDepartments(res.data);
      })
      .catch((err) => {
        console.log('Error:', err);
      });
  }, []);

  useEffect(() => {
    // to only display the first 100 students on load
    if (allStudents.length > 0) {
      const filteredStudents = allStudents.filter((student, i) => i < 100);
      setStudents(filteredStudents);
    }
  }, [allStudents]);

  function viewMore() {
    setStudents(allStudents.filter((student, i) => i < 100 + numberShown));
    setNumberShown(numberShown + 100);
  }

  function handleFilter(e) {
    setSearching(false);
    setSearchError({ active: false });
    setSearchedValue('');
    setSearchingValue('');

    const value = e.target.value;
    if (e.target.name === 'filter-level') {
      if (filteringDepartment.active) {
        if (value === 'None') {
          setStudents(
            allStudents.filter(
              (student) => student.department === filteringDepartment.value
            )
          );
          setFilteringLevel({ active: false, value: '' });
          return;
        }
        setStudents(
          allStudents.filter(
            (student) =>
              student.current_level === Number(value) / 100 &&
              student.department === filteringDepartment.value
          )
        );
      } else {
        if (value === 'None') {
          showAll();
          return;
        }
        setStudents(
          allStudents.filter(
            (student) => student.current_level === Number(value) / 100
          )
        );
      }
      setFilteringLevel({ active: true, value: value });
    } else {
      if (filteringLevel.active) {
        if (value === 'None') {
          setStudents(
            allStudents.filter(
              (student) => student.current_level === filteringLevel.value / 100
            )
          );
          setFilteringDepartment({ active: false, value: '' });
          return;
        }
        setStudents(
          allStudents.filter(
            (student) =>
              student.department === value &&
              student.current_level === filteringLevel.value / 100
          )
        );
      } else {
        if (value === 'None') {
          showAll();
          return;
        }
        setStudents(
          allStudents.filter((student) => student.department === value)
        );
      }
      setFilteringDepartment({ active: true, value: value });
    }
  }

  function handleSearch() {
    setSearching(true);
    setStudents(
      allStudents.filter((student) => {
        const fullName = student.first_name + ' ' + student.last_name;
        return (
          fullName.toLowerCase().includes(searchingValue.toLowerCase()) ||
          student.matric_no.toLowerCase().includes(searchingValue.toLowerCase())
        );
      })
    );
    setSearchedValue(searchingValue);
    setSearchingValue('');
  }

  function showAll() {
    setStudents(allStudents.filter((student, i) => i < 100));
    setNumberShown(100);
    setFilteringLevel({ active: false, value: '' });
    setFilteringDepartment({ active: false, value: '' });
    setSearching(false);
    setSearchError({ active: false });
    setSearchedValue('');
    setSearchingValue('');
  }

  function handleUpdate(id, name) {
    setUpdating(true);
    setUpdateStudent({ id: id, name: name });
  }

  return loading ? (
    <LoadingPage />
  ) : isLoggedIn ? (
    user.type === 'Admin' ? (
      <section className='manage'>
        {updating ? (
          <UpdateForm
            type='student'
            name={updateStudent.name}
            id={updateStudent.id}
            setUpdating={setUpdating}
            setUpdate={setUpdateStudent}
          />
        ) : (
          <>
            <h1>Students</h1>
            <Link to='/admin-dashboard/students/new'>Register New Student</Link>
            <div className='search'>
              <Input
                type='text'
                name='search'
                placeholder='Search student by name or matric number'
                value={searchingValue}
                onChange={(e) => {
                  setSearchingValue(e.target.value);
                  if (searchingValue.length < 3) {
                    setSearchError({
                      active: true,
                      message: 'search word must be 3 characters or more',
                    });
                  } else {
                    setSearchError({ active: false });
                  }
                }}
                error={searchError}
              />
              <Button name='search-students' onClick={handleSearch}>
                Search
              </Button>
            </div>
            <div className='filter'>
              <h3>Filter</h3>
              <div className='filters'>
                <div className='level'>
                  <p>By Level</p>
                  <select name='filter-level' onChange={handleFilter}>
                    <option>None</option>
                    <option>100</option>
                    <option>200</option>
                    <option>300</option>
                    <option>400</option>
                  </select>
                </div>
                <div className='department'>
                  <p>By Department</p>
                  <select name='filter-departments' onChange={handleFilter}>
                    <option>None</option>
                    {departments.map((department) => (
                      <option key={department.id}>{department.name}</option>
                    ))}
                  </select>
                </div>
                <div className='all'>
                  <Button name='show' onClick={showAll}>
                    Show All
                  </Button>
                </div>
              </div>
            </div>
            {searching && <p>Showing search results for {searchedValue}</p>}
            <DisplayTable
              type='student'
              data={students}
              allData={allStudents}
              setAllData={setAllStudents}
              handleUpdate={handleUpdate}
              searching={searching}
              searchedValue={searchedValue}
            />
            {students.length < allStudents.length &&
              !filteringDepartment.active &&
              !filteringLevel.active &&
              !searching && (
                <Button className='more' name='view' onClick={viewMore}>
                  View More
                </Button>
              )}
          </>
        )}
      </section>
    ) : (
      <Navigate replace to={`/${user.type.toLowerCase()}-dashboard`} />
    )
  ) : (
    <Navigate replace to='/login' />
  );
}

export default StudentManager;
