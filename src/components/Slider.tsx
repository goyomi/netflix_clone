import { AnimatePresence, motion } from "framer-motion";
import { useContext, useState } from "react";
import styled from "styled-components";
import { IData, IGetMovie, IGetTvShow } from "../type";
import { useMatch } from "react-router-dom";
import Modal from "./Modal";
import { HomeDataContext, MovieDataContext, TvShowDataContext } from "../context/DataContext";
import ContentImage from "./ContentImage";
import SliderPagination from "./SliderPagination";

const SliderContainer = styled.section`
  position: relative;
  top: -10rem;
`;

const SliderTitle = styled.h3`
  padding: 2rem 1rem;
  font-size: 2.5rem;
`;

const RowContainer = styled.div`
  min-height: 18rem;
  position: relative;
  margin-bottom: 2rem;
`;

const IndexButton = styled(motion.button)<{ way: string }>`
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  position: absolute;
  top: 0;
  bottom: 0;
  ${(props) => (props.way === "left" ? "left: 0;" : "right: 0;")}
  font-size: 5rem;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Row = styled(motion.div)`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  position: absolute;
  top: 0;
`;

const rowVariants = {
  hidden: (direction: string) => ({
    x: direction === "right" ? "100vw" : "-100vw",
  }),
  visible: {
    x: 0,
  },
  exit: (direction: string) => ({
    x: direction === "right" ? "-100vw" : "100vw",
  }),
};

interface ISlider {
  title: string;
  section: string;
  category: string;
}

const offset = 5;

function Slider({ title, section, category }: ISlider) {
  const { nowPlayingData, popularData, topRatedData, upcomingData } = useContext(MovieDataContext);
  const { airingTodayData, onTheAirData, tvPopularData, tvTopRatedData } = useContext(TvShowDataContext);
  const { movieTrendingData, movieTrendingData_2, tvTrendingData, tvTrendingData_2 } = useContext(HomeDataContext);

  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [direction, setDirection] = useState("right");

  let data: IGetMovie | IGetTvShow | null = null;

  if (section === "movie") {
    switch (category) {
      case "now_playing":
        data = nowPlayingData;
        break;
      case "popular":
        data = popularData;
        break;
      case "top_rated":
        data = topRatedData;
        break;
      case "upcoming":
        data = upcomingData;
        break;
      case "trending":
        data = movieTrendingData;
        break;
      case "trending_2":
        data = movieTrendingData_2;
        break;
      default:
        console.error("movie 카테고리 없음");
    }
  } else if (section === "tv") {
    switch (category) {
      case "airing_today":
        data = airingTodayData;
        break;
      case "on_the_air":
        data = onTheAirData;
        break;
      case "popular":
        data = tvPopularData;
        break;
      case "top_rated":
        data = tvTopRatedData;
        break;
      case "trending":
        data = tvTrendingData;
        break;
      case "trending_2":
        data = tvTrendingData_2;
        break;
      default:
        console.error("tv 카테고리 없음");
    }
  }

  const totalMovie = data?.results?.length ?? 0;
  const maxIndex = Math.floor((totalMovie - 1) / offset);
  const variationIndex = (way: string) => {
    if (leaving || !data) return;
    toggleLeaving();
    setDirection(way);

    setIndex((prev) => {
      if (way === "right") {
        return prev === maxIndex ? 0 : prev + 1;
      } else {
        return prev === 0 ? maxIndex : prev - 1;
      }
    });
  };

  const toggleLeaving = () => setLeaving((prev) => !prev);

  const routePattern = `/:section/:category/${section === "movie" ? ":movieId" : ":tvId"}`;
  const dataIdMatch = useMatch(routePattern);
  const idParamName = section === "movie" ? "movieId" : "tvId";
  const matchCard = data?.results.filter((data) => String(data.id) === dataIdMatch?.params[idParamName]);

  let clickedCard = null;
  if (matchCard && matchCard.length > 0) clickedCard = matchCard[0];

  return (
    <>
      <SliderContainer>
        <SliderTitle>{title}</SliderTitle>
        <SliderPagination maxIndex={maxIndex} currentPage={index} />
        <RowContainer>
          <IndexButton key="left" onClick={() => variationIndex("left")} way={"left"}>
            {"<"}
          </IndexButton>
          <AnimatePresence initial={false} onExitComplete={toggleLeaving} custom={direction}>
            <Row
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              custom={direction}
              transition={{ type: "tween", duration: 0.8, ease: "linear" }}
              key={index}
            >
              {data?.results.slice(offset * index, offset * index + offset).map((result: IData) => (
                <ContentImage
                  key={`${result.id}-${title}`}
                  result={result}
                  section={section}
                  category={category}
                  title={title}
                />
              ))}
            </Row>
          </AnimatePresence>
          <IndexButton key="right" onClick={() => variationIndex("right")} way={"right"}>
            {">"}
          </IndexButton>
        </RowContainer>
      </SliderContainer>
      <Modal clickedCard={clickedCard} />
    </>
  );
}

export default Slider;
