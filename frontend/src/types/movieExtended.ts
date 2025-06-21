export interface MovieExtended {
  status: string;
  data:   Data;
}

export interface Data {
  id:                   number;
  name:                 string;
  slug:                 string;
  image:                string;
  nameTranslations:     string[];
  overviewTranslations: string[];
  aliases:              Alias[];
  score:                number;
  runtime:              number;
  status:               Status;
  lastUpdated:          Date;
  year:                 string;
  trailers:             Trailer[];
  genres:               Genre[];
  releases:             Release[];
  artworks:             Artwork[];
  remoteIds:            RemoteID[];
  characters:           Character[];
  budget:               string;
  boxOffice:            string;
  boxOfficeUS:          string;
  originalCountry:      string;
  originalLanguage:     string;
  audioLanguages:       null;
  subtitleLanguages:    null;
  studios:              Studio[];
  awards:               Award[];
  tagOptions:           TagOption[];
  lists:                List[];
  contentRatings:       ContentRating[];
  companies:            Companies;
  production_countries: ProductionCountry[];
  inspirations:         any[];
  spoken_languages:     string[];
  first_release:        Release;
}

export interface Alias {
  language: string;
  name:     string;
}

export interface Artwork {
  id:           number;
  image:        string;
  thumbnail:    string;
  language:     null | string;
  type:         number;
  score:        number;
  width:        number;
  height:       number;
  includesText: boolean;
}

export interface Award {
  id:        number;
  year:      string;
  details:   null;
  isWinner:  boolean;
  category:  string;
  name:      string;
  series:    null;
  movie:     null;
  episode:   null;
  character: null;
}

export interface Character {
  id:                   number;
  name:                 null | string;
  peopleId:             number;
  seriesId:             null;
  series:               null;
  movie:                null;
  movieId:              number;
  episodeId:            null;
  type:                 number;
  image:                string;
  sort:                 number;
  isFeatured:           boolean;
  url:                  string;
  nameTranslations:     null;
  overviewTranslations: null;
  aliases:              null;
  peopleType:           PeopleType;
  personName:           string;
  tagOptions:           null;
  personImgURL:         string;
}

export enum PeopleType {
  Actor = "Actor",
  Director = "Director",
  Producer = "Producer",
  Writer = "Writer",
}

export interface Companies {
  studio:          Production[];
  network:         any[];
  production:      Production[];
  distributor:     any[];
  special_effects: any[];
}

export interface Production {
  id:                   number;
  name:                 string;
  slug:                 string;
  nameTranslations:     null;
  overviewTranslations: null;
  aliases:              null;
  country:              null | string;
  primaryCompanyType:   number;
  activeDate:           Date | null;
  inactiveDate:         null;
  companyType:          CompanyType;
  parentCompany:        ParentCompany;
  tagOptions:           null;
}

export interface CompanyType {
  companyTypeId:   number;
  companyTypeName: string;
}

export interface ParentCompany {
  id:       number | null;
  name:     null | string;
  relation: Relation;
}

export interface Relation {
  id:       null;
  typeName: null;
}

export interface ContentRating {
  id:          number;
  name:        string;
  country:     string;
  description: string;
  contentType: string;
  order:       number;
  fullname:    string;
}

export interface Release {
  country: string;
  date:    Date;
  detail:  null;
}

export interface Genre {
  id:   number;
  name: string;
  slug: string;
}

export interface List {
  id:                   number;
  name:                 string;
  overview:             null | string;
  url:                  string;
  isOfficial:           boolean;
  nameTranslations:     string[];
  overviewTranslations: string[];
  aliases:              any[];
  score:                number;
  image:                string;
  imageIsFallback:      boolean;
  remoteIds:            null;
  tags:                 null;
}

export interface ProductionCountry {
  id:      number;
  country: string;
  name:    string;
}

export interface RemoteID {
  id:         string;
  type:       number;
  sourceName: string;
}

export interface Status {
  id:          number;
  name:        string;
  recordType:  string;
  keepUpdated: boolean;
}

export interface Studio {
  id:           number;
  name:         string;
  parentStudio: number;
}

export interface TagOption {
  id:       number;
  tag:      number;
  tagName:  string;
  name:     string;
  helpText: null;
}

export interface Trailer {
  id:       number;
  name:     string;
  url:      string;
  language: string;
  runtime:  number;
}
