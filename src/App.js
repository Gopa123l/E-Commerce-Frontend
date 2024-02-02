import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import OrderNotifications from './orderNotifications.js';
/*import OrderNotifications2 from './orderNotifications2.js';
import OrderNotifications3 from './orderNotifications3.js';*/

const App = () => {
  const name = "Gopal"
  
  return (
    <>
    <p className='gopi'>My namr is {name}</p>
    <Router>
    <Routes>

    <Route path="/restaurant/:restaurantId" element={<OrderNotifications />} />

    </Routes>
    </Router>
    </>
  );
};

export default App;

