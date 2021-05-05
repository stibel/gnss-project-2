import React, { useState, useEffect, useContext } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from "react-loading";
import Toast from "../services/SignalService";
import { useStyle } from "../contexts/StyleContext";

const HomeScreen = props => {

    const {curStyle} = useStyle();

    const [apod, setApod] = useState({});
    const [fetched, setFetched] = useState(false);

    const getAPOD = async () => {
        try {
            const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
            if (response.ok) {
                const data = await response.json();
                setApod(data);
                setFetched(true);
            } else {
                Toast('Failed to fetch data from NASA API', 'e');
                setFetched(false);
            }
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        getAPOD()
    },[]);

    useEffect(() => {
        console.log(apod);
    }, [apod])

    return (
        <>
            <div style={{
                ...curStyle.layout,
                backgroundImage: `linear-gradient(${curStyle.colours.bluish}, ${curStyle.colours.navy})`,
                height: '90vh',
                width: '100vw',
                fontFamily: curStyle.fonts.family
            }}>
                <div style={{
                    ...curStyle.layout,
                    flexFlow: 'column',
                    width: '50vw',
                    height: '90vh',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: curStyle.fonts.size.title,
                    color: curStyle.colours.darkOrange
                }}>
                    Mikołaj Siebielec
                </div>
                <div style={{
                    ...curStyle.layout,
                    flexFlow: 'column',
                    width: '50vw',
                    height: '90vh',
                    justifyContent: 'center',
                    textAlign: 'center'
                }}>
                    {fetched ?
                        <div style={{
                            ...curStyle.layout,
                            flexFlow: 'column',
                            width: '50vw',
                            height: '90vh',
                            justifyContent: 'center',
                            textAlign: 'center',
                            color: curStyle.colours.darkOrange
                        }}>
                            <p style={{fontSize: curStyle.fonts.size.m}}> {apod.date} <br/> {apod.title}</p>
                            {apod.media_type === "image" ?
                                // eslint-disable-next-line
                                <img style={{
                                    height: '70%',
                                    width: 'auto',
                                    borderRadius: '5%',
                                    filter: `drop-shadow(0 0 1vh ${curStyle.colours.darkOrange})`,
                                    cursor: 'help'
                                }}
                                     src={apod.hasOwnProperty("hdurl") ? apod.hdurl : apod.url}
                                     alt={'APOD'}
                                     title={apod.explanation}
                                />
                                :
                                <iframe style={{
                                    height: '70%',
                                    width: 'auto',
                                    borderRadius: '5%',
                                    filter: `drop-shadow(0 0 1vh ${curStyle.colours.darkOrange})`,
                                    cursor: 'help'
                                }}
                                        src={apod.url}
                                        title={apod.explanation}
                                />
                            }
                            <p style={{fontSize: curStyle.fonts.size.s}}>{apod.copyright}</p>
                        </div>
                        :
                        <Loading type={"spin"} color={curStyle.colours.darkOrange} height={"20%"} />
                    }
                </div>
            </div>
            <ToastContainer />
        </>
    )
}

export default HomeScreen