export default `

type FilmDetails {
  species: [Species]
  starships: [Starship]
  vehicles: [Vehicle]
  characters: [Person]
  planets: [Planet]
}

type Film implements Node {
  title: String
  episodeID: Int
  openingCrawl: String
  director: String
  producers: [String]
  releaseDate: String
  created: String
  edited: String
  details: FilmDetails
  id: ID!
}
`
