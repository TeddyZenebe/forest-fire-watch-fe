import React, { useState, useEffect, useContext } from 'react'
import ReactMapGL, { Popup } from 'react-map-gl'
import styled from 'styled-components'
import { FireDataContext } from '../context/FireDataContext'
import axios from 'axios'
import ReactGA from 'react-ga'

const token = process.env.REACT_APP_MAPBOX_TOKEN
ReactGA.pageview('/public-map')
const PublicMap = ({
  setShowAuthForms,
  setLoginFormStatus,
  setRegisterFormStatus
}) => {
  const {
    fireDataState,
    getCoordinates,
    closeSelectedMarker,
    deleteLocationMarker,
    saveLocationMarker,
    deleteUserLocation,
    updatePopupRadius,
    getUserLocations
  } = useContext(FireDataContext)

  const {
    publicMapViewport,
    allFireMarkers,
    publicCoordinatesMarker,
    localFireMarkers,
    selectedMarker,
    userLocationMarkers,
    userLocalFireMarkers,
    exclamationMarkers
  } = fireDataState
  const [popupRadius, setPopupRadius] = useState('')
  const [viewport, setViewport] = useState({
    latitude: 34.377566,
    longitude: -113.144528,
    zoom: 4
  })

  // Add event listener to window - close whatever pop-up is selected
  useEffect(() => {
    const listener = e => {
      if (e.key === 'Escape') {
        closeSelectedMarker()
      }
    }
    window.addEventListener('keydown', listener)

    return () => {
      window.removeEventListener('keydown', listener)
    }
  }, [])
  useEffect(() => {
    ipAddress()
  }, [])
  useEffect(() => {
    setViewport(publicMapViewport)
  }, [publicMapViewport])
  //prompts the user for their permission to location and sets viewport
  //currently not using due to geocoder issues related to having them both plugged in. IP address is very reliable and does not need any permissions.
  const geoControl = () => {
    navigator.geolocation.getCurrentPosition(position => {
      setViewport({
        ...viewport,
        latitude: parseInt(position.coords.latitude),
        longitude: parseInt(position.coords.longitude),
        width: '100vw',
        height: '100vh',
        zoom: 8
      })
    })
  }

  //Gets the users location based on the IP address of the client and sets the viewport
  const ipAddress = () => {
    axios
      .get(`${process.env.REACT_APP_ENV}users/ip-address`)
      .then(res => {
        if (res.data.status !== 'fail') {
          setViewport({
            ...viewport,
            latitude: res.data.lat,
            longitude: res.data.lon,
            width: '100vw',
            height: '100vh',
            zoom: 8
          })
        } else {
          setViewport({
            ...viewport,
            latitude: 34.377566,
            longitude: -113.144528,
            width: '100vw',
            height: '100vh',
            zoom: 4
          })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  const tempLocationPopup = (
    <div className="save-location-modal">
      <p
        style={{
          fontWeight: '300',
          fontSize: '12px'
        }}
      >
        Want to save this location?
      </p>
      <button
        style={{
          color: '#66BBF0',
          backgroundColor: 'white'
        }}
        className="save-location-btn"
        onClick={e => {
          const token = localStorage.getItem('token')
          if (token) {
            saveLocationMarker()
            deleteLocationMarker()
          } else {
            setShowAuthForms(true)
            setRegisterFormStatus(false)
            setLoginFormStatus(true)
          }
        }}
      >
        Click Here
      </button>
    </div>
  )

  const savedLocationPopup = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span
        style={{
          marginBottom: '6px',
          textAlign: 'center',
          textTransform: 'uppercase',
          fontSize: '14px',
          maxWidth: '25rem'
        }}
      >
        {selectedMarker[2]}
      </span>
      <b />
      <span style={{ marginBottom: '6px', textAlign: 'center' }}>
        {' '}
        Current Radius: {selectedMarker[3]}mi{' '}
      </span>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <FormRadiusInput
          type="text"
          name="PopupRadius"
          placeholder="miles"
          value={popupRadius}
          onChange={e => setPopupRadius(e.target.value)}
          style={{
            height: 8,
            width: 110,
            fontSize: 14,
            margin: '0 10px 0 0'
          }}
        />
        <button
          onClick={() => {
            updatePopupRadius(popupRadius)
            setPopupRadius('')
          }}
          style={{
            marginTop: 3,
            height: 24,
            backgroundColor: '#FC8D43',
            color: 'white'
          }}
        >
          Set Radius
        </button>
      </div>
      <button
        onClick={() => {
          deleteUserLocation(selectedMarker[5])
        }}
        style={{
          marginTop: 6,
          backgroundColor: 'white',
          color: '#66BBF0'
        }}
      >
        Delete this pin
      </button>
    </div>
  )

  const fireLocationPopup = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        fontSize: '1.4rem'
      }}
    >
      {selectedMarker[7]}
    </div>
  )

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div className="public-container"></div>

      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={token}
        width="100vw"
        onViewportChange={viewport => {
          setViewport(viewport)
        }}
        mapStyle="mapbox://styles/astillo/ck1s93bpe5bnk1cqsfd34n8ap"
      >
        {allFireMarkers}
        {userLocalFireMarkers}
        {localFireMarkers}
        {userLocationMarkers}
        {publicCoordinatesMarker}
        {exclamationMarkers}
        {selectedMarker.length > 0 ? (
          <Popup
            closeOnClick={false}
            anchor="top"
            latitude={selectedMarker[0]}
            longitude={selectedMarker[1]}
            onClose={() => {
              closeSelectedMarker()
            }}
          >
            {selectedMarker[4] === 'savedLocation' && savedLocationPopup}
            {selectedMarker[4] === 'tempLocation' && tempLocationPopup}
            {selectedMarker[4] === 'fireLocation' && fireLocationPopup}
          </Popup>
        ) : null}
      </ReactMapGL>
    </div>
  )
}

export default PublicMap

const CheckBoxLabel = styled.label`
  position: absolute;
  top: 0;
  left: 0;
  width: 42px;
  height: 26px;
  border-radius: 15px;
  background: #bebebe;
  cursor: pointer;
  &::after {
    content: '';
    display: block;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    margin: 3px;
    background: #ffffff;
    box-shadow: 1px 3px 3px 1px rgba(0, 0, 0, 0.2);
    transition: 0.2s;
  }
`

const FormRadiusInput = styled.input`
  width: 150px;
  margin: 25px 17.5px 5px 10px;
  padding: 10px;
  font-size: 1em;
  background-color: white;
  border-radius: 5px;
  border: solid 1px black;
  @media (max-width: 576px) {
    width: 200px;
    padding: 8px;
  }
`

const CheckBox = styled.input`
  opacity: 0;
  z-index: 1;
  border-radius: 15px;
  width: 42px;
  height: 26px;
  &:checked + ${CheckBoxLabel} {
    background: #4fbe79;
    &::after {
      content: '';
      display: block;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      margin-left: 21px;
      transition: 0.2s;
    }
  }
`
