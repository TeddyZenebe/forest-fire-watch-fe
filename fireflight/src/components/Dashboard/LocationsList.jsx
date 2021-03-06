import React, {useContext, useState} from 'react'
import { UserDataContext } from '../../context/UserDataContext'
import { FireDataContext } from '../../context/FireDataContext'
import Geocoder from 'react-mapbox-gl-geocoder'
import AddressModal from './UpdateAddressModal'


const LocationsList = props => {
  const {
    userLocations,
    deleteUserLocation,
    history,
    receiveSMS,
    receivePush
  } = props

  const {
    getCoordinates,
    saveInputLocation
  } = useContext(FireDataContext)

  const [addressIndex, setAddressIndex] = useState()
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

 


  return (
    <div className="locations-info">
      <h3>Saved Locations</h3>
      <table className="locations-table">
        <thead>
          <tr className="table-row">
            <th className="locations-header">Address</th>
            <th className="locations-header">Radius</th>
            <th className="locations-header">Alerts</th>
          </tr>
        </thead>

        <tbody>
          {userLocations.map((loc, index) => (
            <tr className="table-row" key={index + loc.radius}>
              <td className="table-data address-field"> {loc.address}</td>
              <td className="table-data radius-field">{loc.radius} mi</td>
              <td className="table-data notifications-field">                
                {/* {loc.notifications ? 'ON' : 'OFF'} */}
                {receiveSMS || receivePush ? 'ON' : 'OFF'}
              </td>
              <td className='icon-container'>
                <i
                  onClick={() => {setOpen(true); setAddressIndex(index)}}
                  className="fas fa-pencil-alt edit-profile-icon"
                />
                {open && <AddressModal handleClose={handleClose} open={open} address={loc.address} radius={loc.radius} id={loc.id} index={addressIndex} setOpen={setOpen} />}
                <div
                  className="delete-location-btn"
                  onClick={() => deleteUserLocation(loc.id)}
                >
                  x
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/*<div className="locations-buttons"> and Add Location button to be deleted after redesign.  */}
      <div className="locations-buttons">
        <button
          className="add-location-btn"
          onClick={() => history.push('/address')}
        >
          Add Location
        </button>
        <button
          className="return-to-map-btn"
          onClick={() => history.push('/home')}
        >
          Return To Map
        </button>
      </div>
    </div>
  )
}

export default LocationsList
