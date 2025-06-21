export interface SerieExtended {
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
  firstAired:           Date;
  lastAired:            Date;
  nextAired:            Date;
  score:                number;
  status:               DataStatus;
  originalCountry:      string;
  originalLanguage:     OriginalLanguage;
  defaultSeasonType:    number;
  isOrderRandomized:    boolean;
  lastUpdated:          Date;
  averageRuntime:       number;
  episodes:             Episode[];
  overview:             string;
  year:                 string;
  artworks:             Artwork[];
  companies:            LatestNetwork[];
  originalNetwork:      LatestNetwork;
  latestNetwork:        LatestNetwork;
  genres:               Genre[];
  trailers:             Trailer[];
  lists:                List[];
  remoteIds:            RemoteID[];
  characters:           Character[];
  airsDays:             AirsDays;
  airsTime:             string;
  seasons:              Season[];
  tags:                 Tag[];
  contentRatings:       ContentRating[];
  seasonTypes:          Type[];
}

export interface AirsDays {
  sunday:    boolean;
  monday:    boolean;
  tuesday:   boolean;
  wednesday: boolean;
  thursday:  boolean;
  friday:    boolean;
  saturday:  boolean;
}

export interface Alias {
  language: string;
  name:     string;
}

export interface Artwork {
  id:              number;
  image:           string;
  thumbnail:       string;
  language:        OriginalLanguage | null;
  type:            number;
  score:           number;
  width:           number;
  height:          number;
  includesText:    boolean;
  thumbnailWidth:  number;
  thumbnailHeight: number;
  updatedAt:       number;
  status:          ArtworkStatus;
  tagOptions:      null;
  seasonId?:       number;
}

export enum OriginalLanguage {
  Ell = "ell",
  Eng = "eng",
  Fra = "fra",
  Hin = "hin",
  Ita = "ita",
  Pt = "pt",
  Rus = "rus",
  SPA = "spa",
}

export interface ArtworkStatus {
  id:   number;
  name: null;
}

export interface Character {
  id:                   number;
  name:                 string;
  peopleId:             number;
  seriesId:             number;
  series:               null;
  movie:                null;
  movieId:              null;
  episodeId:            null;
  type:                 number;
  image:                null | string;
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
}

export interface LatestNetwork {
  id:                   number;
  name:                 string;
  slug:                 string;
  nameTranslations:     string[];
  overviewTranslations: string[];
  aliases:              Alias[];
  country:              string;
  primaryCompanyType:   number;
  activeDate:           null;
  inactiveDate:         null;
  companyType:          CompanyType;
  parentCompany:        ParentCompany;
  tagOptions:           Tag[] | null;
}

export interface CompanyType {
  companyTypeId:   number;
  companyTypeName: string;
}

export interface ParentCompany {
  id:       null;
  name:     null;
  relation: Relation;
}

export interface Relation {
  id:       null;
  typeName: null;
}

export interface Tag {
  id:       number;
  tag:      number;
  tagName:  string;
  name:     string;
  helpText: null | string;
}

export interface ContentRating {
  id:          number;
  name:        string;
  country:     string;
  description: string;
  contentType: string;
  order:       number;
  fullname:    null;
}

export interface Episode {
  id:                   number;
  seriesId:             number;
  name:                 string;
  aired:                Date | null;
  runtime:              number | null;
  nameTranslations:     null;
  overview:             null | string;
  overviewTranslations: null;
  image:                null | string;
  imageType:            number | null;
  isMovie:              number;
  seasons:              null;
  number:               number;
  absoluteNumber:       number;
  seasonNumber:         number;
  lastUpdated:          Date;
  finaleType:           null | string;
  year?:                string;
  airsAfterSeason?:     number;
}

export interface Genre {
  id:   number;
  name: string;
  slug: string;
}

export interface List {
  id:                   number;
  name:                 string;
  overview:             string;
  url:                  string;
  isOfficial:           boolean;
  nameTranslations:     OriginalLanguage[];
  overviewTranslations: OriginalLanguage[];
  aliases:              any[];
  score:                number;
  image:                string;
  imageIsFallback:      boolean;
  remoteIds:            null;
  tags:                 null;
}

export interface RemoteID {
  id:         string;
  type:       number;
  sourceName: string;
}

export interface Type {
  id:            number;
  name:          string;
  type:          string;
  alternateName: null;
}

export interface Season {
  id:                   number;
  seriesId:             number;
  type:                 Type;
  number:               number;
  nameTranslations:     any[];
  overviewTranslations: string[];
  companies:            Companies;
  lastUpdated:          Date;
  image?:               string;
  imageType?:           number;
}

export interface Companies {
  studio:          null;
  network:         null;
  production:      null;
  distributor:     null;
  special_effects: null;
}

export interface DataStatus {
  id:          number;
  name:        string;
  recordType:  string;
  keepUpdated: boolean;
}

export interface Trailer {
  id:       number;
  name:     Name;
  url:      string;
  language: OriginalLanguage;
  runtime:  number;
}

export enum Name {
  Trailer = "Trailer",
}


