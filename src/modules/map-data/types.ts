// also of interest: region_un, subregion, continent, region_wb

export interface GeoJSONFeature {
    type: string;
    properties: {
      name: string;
      name_long: string;
      abbrev: string;
      formal_en: string;
      continent: string;
      region_un: string;
      subregion: string;
      region_wb: string;
      pop_est: number;
      pop_rank: number;
      pop_year: number;
      gdp_md: number;
      gdp_year: number;
      economy: string;
      income_grp: string;
      iso_a2: string;
      iso_a3: string;
      iso_n3: string;
      un_a3: string;
      wb_a2: string;
      wb_a3: string;
      woe_id: number;
      adm0_a3: string;
      name_len: number;
      long_len: number;
      abbrev_len: number;
      tiny: number;
      homepart: number;
      min_zoom: number;
      min_label: number;
      max_label: number;
      label_x: number;
      label_y: number;
      ne_id: number;
      wikidataid: string;
      name_ar: string;
      name_bn: string;
      name_de: string;
      name_en: string;
      name_es: string;
      name_fa: string;
      name_fr: string;
      name_el: string;
      name_he: string;
      name_hi: string;
      name_hu: string;
      name_id: string;
      name_it: string;
      name_ja: string;
      name_ko: string;
      name_nl: string;
      name_pl: string;
      name_pt: string;
      name_ru: string;
      name_sv: string;
      name_tr: string;
      name_uk: string;
      name_ur: string;
      name_vi: string;
      name_zh: string;
      name_zht: string;
    };
    geometry: {
      type: string;
      coordinates: number[][][];
    };
  }
  
  export interface GeoJSONData {
    type: string;
    features: GeoJSONFeature[];
  }
  