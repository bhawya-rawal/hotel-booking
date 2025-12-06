import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import { IRoom } from '../interfaces/IRoom';
import Rating from './Rating';

type IRoomCard = Pick<IRoom, '_id' | 'images' | 'name' | 'pricePerNight' | 'ratings'>;

const RoomCard: React.FC<IRoomCard> = (props: IRoomCard) => {

  const { _id, images, name, pricePerNight, ratings } = props;
  const apiUrl = process.env.REACT_APP_API_URL || '';
  const imgSrc = `${apiUrl}${images[0].image}`;

  return (
    <Card className="card-room">
        <Card.Img variant="top" src={imgSrc} />
        <Card.Body>
            <Card.Title as="h5">
              <Link to={`/room/${_id}`}>{name}</Link>
            </Card.Title>
            <div className="price-tag">₹{pricePerNight} <small style={{fontWeight:400,fontSize:'0.82rem',color:'#888'}}>/night</small></div>
            <Rating reviews={ratings} />
            <LinkContainer to={`/room/${_id}`}>
              <Button className="btn-view">View Details</Button>
            </LinkContainer>
        </Card.Body>
    </Card>
  );
};

export default RoomCard;
