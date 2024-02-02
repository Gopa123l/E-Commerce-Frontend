import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
//import { Link } from 'react-router-dom';

const OrderNotifications = () => {
  const { restaurantId } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [selectedNotifications, setSelectedNotifications] = useState({});
  const [mappedFetchedNotifications, setMappedFetchedNotifications] = useState([]);
  const [loader, setLoader] = useState(false)

  useEffect(() => {
    const socket = io(`http://localhost:5000/${restaurantId}`); // Replace with your backend server URL
    setSocket(socket);


    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });


    socket.on('newOrders', (data) => {
      try {
        // Update the 'notifications' state with the received order data

        setNotifications((prevNotifications) => [...prevNotifications, data]);

        // Show the data of the new order in the console
        console.log("New Order Data:", data);
      } catch (error) {
        console.error('Error handling newOrder event:', error);
      }
    })

    socket.on('notificationsUpdated', (updatedNotificationIds) => {
      // Remove the updated notifications from the notifications state
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => !updatedNotificationIds.includes(notification?.notification?._id)
        ))
      setMappedFetchedNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => !updatedNotificationIds.includes(notification?._id)
        ))
    });

    socket.on('notificationsCleared', (clearedNotificationIds) => {
      // Remove the cleared notifications from the notifications state
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => !clearedNotificationIds.includes(notification?.notification?._id)
        ));
      setMappedFetchedNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => !clearedNotificationIds.includes(notification?._id)
        ));
    });

    fetchUnreadNotifications()

    return () => {
      socket.disconnect();
    };
  }, [restaurantId]);



  const fetchUnreadNotifications = async () => {
    setLoader(true)
    try {
      const response = await fetch('http://localhost:5000/api/notifications/unread')
      const data = await response.json();
      setMappedFetchedNotifications(data);

    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
    setLoader(false)
  };


  const handleRead = async () => {
    try {
      const notificationIdsToRead = Object.keys(selectedNotifications)
        .filter((notificationId) => selectedNotifications[notificationId])
        .map((notificationId) => notificationId);
      if (notificationIdsToRead.length > 0) {
        socket.emit('markAsRead', notificationIdsToRead);
      }
    } catch (error) {
      console.error('Error handling read:', error);
    }
  };



  const handleClear = async () => {
    try {
      // Extract notification IDs to mark as cleared
      const newnotificationIdsToClear = notifications
        .filter((notification) => !notification?.notification?.delete)
        .map((notification) => notification?.notification?._id);

      const oldnotificationIdsToClear = mappedFetchedNotifications
        .filter((notification) => !notification?.delete)
        .map((notification) => notification?._id);

      const notificationIdsToClear = [...newnotificationIdsToClear, ...oldnotificationIdsToClear];
      console.log("notificationids", notificationIdsToClear)

      socket.emit('markAsCleared', notificationIdsToClear);
    } catch (error) {
      console.error('Error handling clear:', error);
    }
  }

  return (
    <div>

      <h1>Restaurant App</h1>
      <h1>New Order Notifications:</h1>
      <button onClick={handleRead}>Read</button>
      <button onClick={handleClear}>ClearAll</button>
      {loader && <p>Loading...</p>}
      {notifications.length === 0 && mappedFetchedNotifications.length === 0 ? (
        <p>No new order notifications.</p>
      ) : (
        <div>
          real time notification
          <ul>
            {notifications.map((notification, index) => {
              return (
                <li key={index}>
                  <input
                    type="checkbox"
                    checked={selectedNotifications[notification?.notification?._id] || false}
                    onChange={(e) => {
                      setSelectedNotifications((prevSelected) => ({
                        ...prevSelected,
                        [notification?.notification?._id]: e.target.checked,
                      }));
                    }}
                  />

                  Read: {notification?.notification?.read ? 'Yes' : 'No'},
                  Deleted: {notification?.notification?.delete ? 'Yes' : 'No'},
                  Order No: {notification?.orderData?.orderNo},
                  Products Ordered: {notification?.orderData?.product?.product_name},Product_price:{notification?.orderData?.product?.price}, Product quantity:{notification?.orderData?.product?.quantity},
                  Username: {notification?.orderData?.user?.name}, Useremail:{notification?.orderData?.user?.email},
                </li>

              )
            })}


          </ul>
          old notification
          <ul>
            {
              mappedFetchedNotifications.map((notification, index) => {
                console.log(notification)
                return (
                  <li key={index}>
                    <input
                      type="checkbox"
                      checked={selectedNotifications[notification?._id] || false}
                      onChange={(e) => {
                        setSelectedNotifications((prevSelected) => ({
                          ...prevSelected,
                          [notification?._id]: e.target.checked,
                        }));
                      }}
                    />

                    Read: {notification?.read ? 'Yes' : 'No'},
                    Deleted: {notification?.delete ? 'Yes' : 'No'},
                    Order No: {notification?.order?.orderNo},
                    Products Ordered: {notification?.order?.product_id?.map(item => item.product_name).join(',')},
                    Product_price:{notification?.order?.product_id?.map(item => item.price).join(',')},
                    Product quantity:{notification?.order?.product_id?.map(item => item.quantity).join(',')},
                    Username: {notification?.order?.user_id?.map(item => item.name).join(',')}
                    Useremail:{notification?.order?.user_id?.map(item => item.email).join(',')},
                  </li>
                )
              })
            }
          </ul>
        </div>
      )}
    </div>
  );
};

export default OrderNotifications;


