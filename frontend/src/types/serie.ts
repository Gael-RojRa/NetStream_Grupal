export interface Serie {
  status: string;
  data:   Datum[];
}

export interface Datum {
  id:                   number;
  name:                 string;
  slug:                 string;
  image:                string;
  nameTranslations:     string[];
  overviewTranslations: string[];
  aliases:              Alias[];
  firstAired:           Date;
  lastAired:            Date;
  nextAired:            string;
  score:                number;
  status:               Status;
  originalCountry:      OriginalCountry;
  originalLanguage:     OriginalLanguage;
  defaultSeasonType:    number;
  isOrderRandomized:    boolean;
  lastUpdated:          Date;
  averageRuntime:       number;
  episodes:             null;
  overview:             string;
  year:                 string;
}

export interface Alias {
  language: string;
  name:     string;
}

export enum OriginalCountry {
  Can = "can",
  Usa = "usa",
}

export enum OriginalLanguage {
  Eng = "eng",
}

export interface Status {
  id:          null;
  name:        null;
  recordType:  string;
  keepUpdated: boolean;
}
