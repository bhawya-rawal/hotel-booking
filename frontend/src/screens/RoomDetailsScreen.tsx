import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch, RootStateOrAny } from 'react-redux';
import { getRoomDetails } from '../redux/actions/RoomActions';
import { IRoom } from '../interfaces/IRoom';
import Loader from '../components/Loader';
import { Container, Row, Col, Carousel, Button, Card } from 'react-bootstrap';
import FormReview from '../components/FormReview';
import Message from '../components/Message';
import Rating from '../components/Rating';
import { checkRoomBooking } from '../redux/actions/BookingActions';
import ListReviews from '../components/ListReviews';
import RoomFeatures from '../components/RoomFeatures';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { Link } from 'react-router-dom';
import { CHECK_ROOM_BOOKING_RESET, CREATE_BOOKING_RESET } from '../redux/constants/BookingConstants';
import { createBooking } from '../redux/actions/BookingActions';
import { getBookedDates } from '../redux/actions/BookingActions';
import { IBooking } from '../interfaces/IBooking';

type TId = {
    id: IRoom['_id']
}

const RoomDetailsScreen = () => {

    const { loggedIn } = useAuthStatus();

    const [checkInDate, setCheckInDate] = useState<IBooking['checkInDate']>();
    const [checkOutDate, setCheckOutDate] = useState<IBooking['checkOutDate']>();
    const [daysOfStay, setDaysOfStay] = useState<IBooking['daysOfStay']>(0);

    const { id } = useParams<TId>();

    const dispatch = useDispatch();

    const { loading, room, error } = useSelector((state: RootStateOrAny) => state.roomDetails);

    const { loading: loadingCreateReview, success: successCreateReview, error: errorCreateReview } = 
    useSelector((state: RootStateOrAny) => state.roomCreateReview);

    const { loading: loadingRoomIsAvailable, success: successRoomIsAvailable, error: errorRoomIsAvailable }
    = useSelector((state: RootStateOrAny) => state.roomBookingCheck);

    const { loading: loadingBookingCreate, success: successBookingCreate, error: errorBookingCreate } 
    = useSelector((state: RootStateOrAny) => state.bookingCreate);

    const {bookedDates} = useSelector((state: RootStateOrAny) => state.bookedDates);

    useEffect(() => {
        dispatch(getRoomDetails(id as string));
        dispatch(getBookedDates(id as string));
        dispatch({ type: CHECK_ROOM_BOOKING_RESET });
        dispatch({ type: CREATE_BOOKING_RESET });
    }, [dispatch, id]);

    const onChange = (dates: any) => {
        const [checkInDate, checkOutDate] = dates;
        setCheckInDate(checkInDate as Date);
        setCheckOutDate(checkOutDate as Date);

        if (checkInDate && checkOutDate) {

            // Calclate days of stay

            const days = Math.abs(checkInDate - checkOutDate) / (1000 * 60 * 60 * 24);

            setDaysOfStay(days);

            dispatch(checkRoomBooking(id as string, checkInDate.toISOString(), checkOutDate.toISOString()));

        }

    }

    const excludedDates: any[] = []
    bookedDates?.forEach((date: Date) => {
        excludedDates.push(new Date(date))
    })

    const handleConfirmBooking = () => {
        const amountPaid = Number(room.pricePerNight) * Number(daysOfStay);
        const paymentInfo = {
            id: `BMR-${Date.now()}`,
            status: 'CONFIRMED',
            update_time: new Date().toISOString(),
            email_address: '',
        };
        const bookingData = {
            room: id,
            checkInDate,
            checkOutDate,
            amountPaid,
            paymentInfo,
            daysOfStay,
        };
        dispatch(createBooking(bookingData));
        dispatch(getBookedDates(id as string));
        dispatch({ type: CHECK_ROOM_BOOKING_RESET });
        dispatch({ type: CREATE_BOOKING_RESET });
    };

  return (
      <Container className="pb-4">
        <Row>
            {loading ? <Loader /> : error ? <Message variant="danger">{error}</Message> : (
                <Col>
                    <h1 className="mb-2">{room.name}</h1>
                    <span className="d-block mb-2">{room.address}</span>
                    <Rating reviews={room.ratings} />
                    <div className="carousel-room mt-3 mb-3">
                        <Carousel>
                            {room.images?.map((img: any) => (
                                <Carousel.Item key={img._id}>
                                    <img
                                        className="d-block w-100"
                                        src={img.image}
                                        alt={img._id}
                                    />
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </div>
                    <Row>
                        <Col xs={12} sm={12} md={8}>
                            <h3>Description</h3>
                            <p>
                                {room.description}
                            </p>

                            <RoomFeatures room={room} />

                            <h4 className="mt-3 mb-4">Reviews</h4>

                            {errorCreateReview && <Message variant="danger">{errorCreateReview}</Message>}
                            {successCreateReview && <Message variant="success">Added Review</Message>}
                            
                            <FormReview idRoom={room._id} />
                            
                            <hr />
                            {loadingCreateReview && <Loader />}

                            <ListReviews roomReviews={room.reviews} />

                        </Col>
                        <Col xs={12} sm={12} md={4}>
                            <div className="booking-card">
                                <div className="booking-card-header">
                                    <span className="booking-price">₹{room.pricePerNight}</span>
                                    <span className="booking-per-night"> / night</span>
                                </div>
                                <hr className="booking-divider" />
                                <p className="booking-date-label">Select Check-in &amp; Check-out</p>
                                <div className="booking-datepicker-wrap">
                                    <DatePicker
                                        dateFormat="DD-MM-YYYY"
                                        className='w-100'
                                        selected={checkInDate}
                                        onChange={onChange}
                                        startDate={checkInDate}
                                        endDate={checkOutDate}
                                        minDate={new Date()}
                                        excludeDates={excludedDates}
                                        selectsRange
                                        inline
                                    />
                                </div>

                                {loadingRoomIsAvailable && <Loader />}

                                {successRoomIsAvailable && daysOfStay > 0 && (
                                    <div className="booking-summary">
                                        <div className="booking-summary-row">
                                            <span>₹{room.pricePerNight} × {daysOfStay} night{Number(daysOfStay) > 1 ? 's' : ''}</span>
                                            <span>₹{Number(room.pricePerNight) * Number(daysOfStay)}</span>
                                        </div>
                                        <div className="booking-summary-row booking-summary-total">
                                            <span>Total</span>
                                            <span>₹{Number(room.pricePerNight) * Number(daysOfStay)}</span>
                                        </div>
                                    </div>
                                )}

                                {errorRoomIsAvailable && <Message variant="danger">{errorRoomIsAvailable}</Message>}

                                {loggedIn && successRoomIsAvailable && !successBookingCreate && (
                                    <Button
                                        className="booking-confirm-btn"
                                        onClick={handleConfirmBooking}
                                        disabled={loadingBookingCreate}
                                    >
                                        {loadingBookingCreate ? <Loader /> : 'Confirm Booking'}
                                    </Button>
                                )}

                                {!loggedIn && (
                                    <div className="booking-login-msg">
                                        <Link to="/login">Sign in</Link> to book this room
                                    </div>
                                )}

                                {successBookingCreate && (
                                    <Message variant="success">
                                        🎉 Booking confirmed! Check <Link to="/bookings/me">My Bookings</Link>.
                                    </Message>
                                )}

                                {errorBookingCreate && (
                                    <Message variant="danger">{errorBookingCreate}</Message>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Col>
            )}
        </Row>
      </Container>
  );
};

export default RoomDetailsScreen;
