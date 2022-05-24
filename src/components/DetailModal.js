import React, { useState, useEffect, useRef } from "react";
import {
  getPokemonDetails,
  formatPokemonName,
  formatStatName,
  getPokemonEvolutions,
} from "./Api";
import { getTypeColorGradient } from "./PokemonCard";
import { TYPE_COLORS, STAT_COLORS } from "../constants/constants";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import pokeballIcon from "../assets/img/pokeball-icon.png";
import loadingIcon from "../assets/img/pikachu-running.gif";

const DetailModal = ({ detailPokemon, allPokemonDetails, toggleModal }) => {
  const modalBackground = useRef();
  const [pokemonDetails, setPokemonDetails] = useState(detailPokemon);
  const [speciesInfo, setSpeciesInfo] = useState();
  const [evolutionInfo, setEvolutionInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSpeciesInfo = async () => {
      const speciesData = await getPokemonDetails(pokemonDetails.species.url);
      setSpeciesInfo(speciesData);

      const evolutionData = await getPokemonEvolutions(
        speciesData.evolution_chain.url
      );
      setEvolutionInfo(evolutionData);

      setLoading(false);
    };

    setLoading(true);
    if (pokemonDetails != null) {
      getSpeciesInfo();
    }
  }, [pokemonDetails]);

  const handleBackgroundClick = (e) => {
    if (e.target === modalBackground.current) {
      toggleModal();
    }
  };

  const typeColorGradient = getTypeColorGradient(pokemonDetails.types);

  const changeCurrentPokemon = (pokemonId) => {
    setPokemonDetails(allPokemonDetails[pokemonId - 1]);
  };

  return (
    <div
      ref={modalBackground}
      className="modal-background"
      onClick={handleBackgroundClick}
    >
      <div
        className="modal-container"
        style={{
          background: `linear-gradient(${typeColorGradient[0]} 35%, ${typeColorGradient[1]}) 100%`,
        }}
      >
        <div className="info-box-sprite info-text">
          <h4 className="pokemon-text">
            {"#" + ("00" + pokemonDetails.id).slice(-3)}
          </h4>
          <img
            className="pokeball-icon"
            src={pokeballIcon}
            alt="pokeball icon"
          />
          <div className="modal-sprite-container">
            <LazyLoadImage
              className="pokemon-sprite"
              src={
                pokemonDetails.sprites.other["official-artwork"].front_default
              }
              alt={pokemonDetails.name}
              effect="blur"
            />
          </div>
          <h3 className="pokemon-text">
            {formatPokemonName(pokemonDetails.species.name)}
          </h3>
          <div className="pokemon-genera">
            {loading ? "Loading..." : speciesInfo.genera[7].genus}
          </div>
          <div className="type-list">
            {pokemonDetails.types.map((type) => (
              <span
                key={type.slot}
                className="type-badge"
                style={{ backgroundColor: `${TYPE_COLORS[type.type.name]}` }}
              >
                {type.type.name.charAt(0).toUpperCase() +
                  type.type.name.slice(1)}
              </span>
            ))}
          </div>
          <div className="pokemon-dimensions">
            <div className="pokemon-height">
              <h5>Height</h5>
              <span>{pokemonDetails.height / 10}m</span>
            </div>
            <div className="pokemon-weight">
              <h5>Weight</h5>
              <span>{pokemonDetails.weight / 10}kg</span>
            </div>
          </div>
          <div className="pokemon-gender">
            <h5>Gender Ratio</h5>
            <div className="gender-ratio-container">
              {loading ? (
                <span>Loading...</span>
              ) : speciesInfo.gender_rate === -1 ? (
                <span>Gender Unknown</span>
              ) : (
                <>
                  <div
                    className="gender-ratio-segment"
                    style={{
                      backgroundColor: "#3355FF",
                      width: `${100 - speciesInfo.gender_rate * 12.5}%`,
                      borderRadius:
                        speciesInfo.gender_rate === 0
                          ? "1rem"
                          : "1rem 0 0 1rem",
                    }}
                  ></div>
                  <div
                    className="gender-ratio-segment"
                    style={{
                      backgroundColor: "#FF77DD",
                      width: `${speciesInfo.gender_rate * 12.5}%`,
                      borderRadius:
                        speciesInfo.gender_rate === 8
                          ? "1rem"
                          : "0 1rem 1rem 0",
                    }}
                  ></div>
                </>
              )}
            </div>
            <div
              className="gender-percentages"
              style={{
                opacity: loading ? 0 : speciesInfo.gender_rate === -1 ? 0 : 1,
              }}
            >
              <span style={{ color: "#6982ff" }}>
                {loading ? "-" : 100 - speciesInfo.gender_rate * 12.5}% male,{" "}
              </span>
              <span style={{ color: "#FF77DD" }}>
                {loading ? "-" : speciesInfo.gender_rate * 12.5}% female
              </span>
            </div>
          </div>
        </div>
        <div className="info-box-right">
          <div className="pokemon-description right-section">
            <h5 className="pokemon-text">Description</h5>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <p>
                {
                  speciesInfo.flavor_text_entries
                    .slice()
                    .reverse()
                    .find((flavor) => flavor.language.name === "en").flavor_text
                }
              </p>
            )}
          </div>
          <div className="pokemon-stats right-section">
            <h5 className="pokemon-text">Stats</h5>
            <div className="parameter-container">
              {pokemonDetails.stats.map((stat) => {
                return (
                  <div key={stat.stat.name} className="parameter-section">
                    <h6 className="info-text">
                      {formatStatName(stat.stat.name)}
                    </h6>
                    <div className="statbar-container">
                      <div
                        className="statbar-segment"
                        style={{
                          backgroundColor: STAT_COLORS[stat.stat.name],
                          width: `${(stat.base_stat / 255) * 100}%`,
                        }}
                      >
                        <span>{stat.base_stat}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pokemon-evolution right-section">
            <h5 className="pokemon-text">Evolution</h5>
            <div className="evolution-container">
              {!loading ? (
                evolutionInfo.map((column, i) => (
                  <React.Fragment key={i}>
                    <div
                      className={`evolution-column ${
                        column.length === 2
                          ? "two-items"
                          : column.length > 2
                          ? "more-items"
                          : ""
                      }`}
                    >
                      {column.map((item) => (
                        <div
                          key={item}
                          className="evolution-item"
                          onClick={() => changeCurrentPokemon(item)}
                        >
                          <div className="evolution-sprite-container">
                            <LazyLoadImage
                              className="evolution-sprite"
                              src={
                                allPokemonDetails[item - 1].sprites.other[
                                  "official-artwork"
                                ].front_default
                              }
                              alt={allPokemonDetails[item - 1].name}
                              effect="blur"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    {i + 1 !== evolutionInfo.length && (
                      <div className="evolution-arrow">
                        <span>&#10145;</span>
                      </div>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <img
                  className="evolution-loading"
                  src={loadingIcon}
                  alt="loading icon"
                />
              )}
            </div>
          </div>
        </div>
        <button className="modal-close" onClick={toggleModal}>
          &times;
        </button>
      </div>
    </div>
  );
};

export default DetailModal;
