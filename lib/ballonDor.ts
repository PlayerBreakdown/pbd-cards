import { CardIndex } from "@/lib/cardTypes";
import { cardsIndex } from "@/lib/cardIndex";

export type BallonDorEntry = {
  seasonEnd: number;
  seasonText: string;
  ballonDorCardId: string;
  pbpCardId: string;
  ballonDorNote: string;
  analysis: string;
};

type EditableBallonDorEntry = Omit<BallonDorEntry, "pbpCardId"> & {
  pbpCardId?: string;
};

const editableEntries: EditableBallonDorEntry[] = [
  {
    seasonEnd: 2026,
    seasonText: "2025-26",
    ballonDorCardId: "",
    ballonDorNote: "Balón de Oro por anunciarse.",
    analysis:
      "El Balón de Oro aún no ha sido entregado. Además, este es un año mundialista, y esa competición suele tener un gran peso en la decisión final de este premio. Sin contar el Mundial, Lamine Yamal es nuestro ganador con 99 puntos, aunque Harry Kane quedó muy cerca con 98.",
  },
  {
    seasonEnd: 2025,
    seasonText: "2024-25",
    ballonDorCardId: "ousmanedembele_pvpv1_2025",
    ballonDorNote: "MVP Balón de Oro real para la comparativa ofensiva.",
    analysis:
      "En este caso, nuestra elección se dio por cuestión de decimales, ya que ambos cuentan con una puntuación cercana a 90. La diferencia pudo estar en que Dembélé ganó la Champions con el PSG, porque estadísticamente están prácticamente empatados. Aunque incluso en esa competición, el brasileño tuvo mejor desempeño que el francés.",
  },
  {
    seasonEnd: 2024,
    seasonText: "2023-24",
    ballonDorCardId: "viniciusjunior_pvpv1_2024",
    ballonDorNote: "Rodri ganó el galardón real; aquí se toma al mejor jugador ofensivo posicionado.",
    analysis:
      "El galardón este año fue para Rodri. Sin embargo, como estamos calificando jugadores ofensivos, tomamos como referencia al mejor posicionado en esa categoría, que fue Vinícius. Aun así, estadísticamente Mbappé fue muy superior. A pesar de haber ganado el triplete nacional, la Champions conquistada por el brasileño terminó eclipsando al francés.",
  },
  {
    seasonEnd: 2023,
    seasonText: "2022-23",
    ballonDorCardId: "lionelmessi_pvpv1_2023",
    ballonDorNote: "Messi ganó el Balón de Oro 2023.",
    analysis:
      "El Balón de Oro este año fue para Messi. Estadísticamente, no alcanzó el nivel de Mbappé, por lo que el premio puede atribuirse principalmente a su gran desempeño en el Mundial y, sobre todo, al hecho de haberlo ganado. Mbappé también tuvo un torneo igual o incluso mejor a nivel individual, pero la victoria final terminó marcando la diferencia.",
  },
  {
    seasonEnd: 2022,
    seasonText: "2021-22",
    ballonDorCardId: "karimbenzema_pvpv1_2022",
    ballonDorNote: "Benzema ganó el Balón de Oro 2022.",
    analysis:
      "Aunque Mbappé fue superior estadísticamente, Benzema conquistó más títulos y tuvo un desempeño increíble en la Champions League ganada por el Real Madrid esa temporada.",
  },
  {
    seasonEnd: 2021,
    seasonText: "2020-21",
    ballonDorCardId: "lionelmessi_pvpv1_2021",
    ballonDorNote: "Messi ganó el Balón de Oro 2021.",
    analysis: "Ganador coincide.",
  },
  {
    seasonEnd: 2020,
    seasonText: "2019-20",
    ballonDorCardId: "robertlewandowski_pvpv1_2020",
    ballonDorNote: "El Balón de Oro 2020 no fue entregado; se usa a Lewandowski como referencia popular.",
    analysis:
      "Este año no se entregó el premio debido a la pandemia. Estadísticamente, el mejor fue Messi; sin embargo, la opinión popular estuvo del lado de Lewandowski, quien conquistó la Champions League y registró un récord goleador en la Bundesliga.",
  },
  {
    seasonEnd: 2019,
    seasonText: "2018-19",
    ballonDorCardId: "lionelmessi_pvpv1_2019",
    ballonDorNote: "Messi ganó el Balón de Oro 2019.",
    analysis: "Ganador coincide.",
  },
  {
    seasonEnd: 2018,
    seasonText: "2017-18",
    ballonDorCardId: "cristianoronaldo_pvpv1_2018",
    ballonDorNote: "Modric ganó el Balón de Oro 2018; aquí se toma a Cristiano Ronaldo como referencia ofensiva.",
    analysis:
      "Este año el premio fue para Modrić, pero como se trata de una comparativa ofensiva, tomamos como referencia al segundo lugar: Cristiano Ronaldo. El portugués tuvo peores números que el argentino; sin embargo, ganó cuatro títulos, mientras que Messi consiguió tres.",
  },
  {
    seasonEnd: 2017,
    seasonText: "2016-17",
    ballonDorCardId: "cristianoronaldo_pvpv1_2017",
    ballonDorNote: "Cristiano Ronaldo ganó el Balón de Oro 2017.",
    analysis:
      "El argentino lo supera ampliamente en estadísticas. Sin embargo, ese año su palmarés solo sumó una Copa del Rey, mientras que Cristiano consiguió cinco títulos esa temporada: Champions League, Liga, Supercopa de Europa, Supercopa de España y Mundial de Clubes.",
  },
  {
    seasonEnd: 2016,
    seasonText: "2015-16",
    ballonDorCardId: "cristianoronaldo_pvpv1_2016",
    ballonDorNote: "Cristiano Ronaldo ganó el Balón de Oro 2016.",
    analysis:
      "Messi tuvo números muy superiores a los del portugués, por lo que el galardón terminó decidiéndose principalmente por los títulos ganados. Cristiano conquistó la Champions League y también la primera Eurocopa en la historia de su país.",
  },
];

export const ballonDorEntries: BallonDorEntry[] = editableEntries.map((entry) => ({
  ...entry,
  pbpCardId: entry.pbpCardId ?? bestPbpCardForSeason(entry.seasonEnd)?.id ?? "",
}));

export function cardById(cardId: string) {
  return cardsIndex.find((card) => card.id === cardId) ?? null;
}

export function bestPbpCardForSeason(seasonEnd: number): CardIndex | null {
  return (
    cardsIndex
      .filter((card) => Number(card.season_end) === seasonEnd)
      .sort((a, b) => scoreValue(b) - scoreValue(a))[0] ?? null
  );
}

function scoreValue(card: CardIndex) {
  return Number(card.scores?.overall ?? card.overall ?? 0);
}
