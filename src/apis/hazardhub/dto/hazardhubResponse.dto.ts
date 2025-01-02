/* eslint-disable camelcase */
/* eslint-disable sort-exports/sort-exports */
/* eslint-disable camelcase */
import { AddressDto } from '@ignidus/iscx-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
class LandcoverRiskDetailDto {
    @ApiProperty({ description: 'Description of the area', type: String, required: false })
    area_desc?: string;

    @ApiProperty({ description: 'Description of the site', type: String, required: false })
    site_desc?: string;
}

class LandcoverRiskDto {
    @ApiProperty({ description: 'Risk score', type: Number })
    score: number;

    @ApiProperty({ description: 'Risk description', type: String })
    desc: string;

    @ApiProperty({ description: 'Details about the risk area', type: LandcoverRiskDetailDto })
    detail: LandcoverRiskDetailDto;

    @ApiProperty({ description: 'List of proximate landcover areas', isArray: true })
    proximate_landcover_areas: any[];
}

class KatabaticWindRiskDto {
    @ApiProperty({ description: 'Risk score', type: Number })
    score: number;

    @ApiProperty({ description: 'Name of the wind region', type: String })
    name: string;

    @ApiProperty({ description: 'Description of the wind risk', type: String })
    desc: string;
}

class FireSeasonPrecipRiskDto {
    @ApiProperty({ description: 'Risk score', type: Number })
    score: number;

    @ApiProperty({ description: 'Average monthly precipitation', type: Number })
    monthly_avg_precip: number;

    @ApiProperty({ description: 'Description of the precipitation risk', type: String })
    desc: string;
}

class WildfirePerimeterRiskDto {
    @ApiProperty({ description: 'Risk score', type: Number })
    score: number;

    @ApiProperty({ description: 'Description of the wildfire perimeter risk', type: String })
    desc: string;

    @ApiProperty({ description: 'Proximate wildfire perimeters', isArray: true })
    proximate_wildfire_perimeters: any[];
}

class RiskScoresDto {
    @ApiProperty({ description: 'Base risk score', type: Number })
    base: number;

    @ApiProperty({ description: 'Composite risk score', type: Number })
    composite: number;
}

class VegetationBurnSiteRiskDto {
    @ApiProperty({ description: 'Risk score', type: Number })
    score: number;

    @ApiProperty({ description: 'Description of the vegetation burn site risk', type: String })
    desc: string;

    @ApiProperty({ description: 'Number of vegetation burns within half a mile', type: Number })
    within_half_mile: number;

    @ApiProperty({ description: 'Number of vegetation burns within one mile', type: Number })
    within_one_mile: number;
}

class WildfireRiskScoreDto {
    @ApiProperty({ description: 'Value of the wildfire risk score', type: String })
    value: string;

    @ApiProperty({ description: 'Composite score of the wildfire risk', type: Number })
    composite: number;
}

class WildfireDto {
    @ApiProperty({ description: 'Wildfire score', type: String })
    score: string;

    @ApiProperty({ description: 'Wildfire risk description', type: String })
    text: string;
}

class DroughtDto {
    @ApiProperty({ description: 'Drought score', type: String })
    score: string;

    @ApiProperty({ description: 'Drought risk description', type: String })
    text: string;
}

class DroughtFrequencyIndexDto {
    @ApiProperty({ description: 'Drought score', type: String })
    score: string;

    @ApiProperty({ description: 'Text description of drought', type: String })
    text: string;

    @ApiProperty({ description: 'Percentage description', type: String })
    pct: string;

    @ApiProperty({ description: 'Description of drought frequency', type: String })
    desc: string;
}

class WildfireHistoryParamsDto {
    @ApiProperty({ description: 'Wildfire risk', type: String })
    risk: string;

    @ApiProperty({ description: 'Number of wildfires', type: Number })
    number_of_wildfires: number;

    @ApiProperty({ description: 'Number of wildfires nearby', type: Number })
    number_of_wildfires_near: number;

    @ApiProperty({ description: 'Year name', type: String, required: false })
    year_name?: string;

    @ApiProperty({ description: 'Year name distance', type: String, required: false })
    year_name_distance?: string;
}

class DistanceToSignificantWfRiskParamsDto {
    @ApiProperty({ description: 'Risk description', type: String })
    risk: string;

    @ApiProperty({ description: 'Very high risk', type: Number, required: false })
    very_high?: number;

    @ApiProperty({ description: 'High risk', type: Number, required: false })
    high?: number;

    @ApiProperty({ description: 'Moderate risk', type: Number, required: false })
    moderate?: number;
}

class FireSeasonPrecipitationParamsDto {
    @ApiProperty({ description: 'Fire season risk description', type: String })
    risk: string;

    @ApiProperty({ description: 'Scale of risk', type: String })
    scale: string;

    @ApiProperty({ description: 'Fire season precipitation amount', type: String })
    fire_season_precipitation: string;
}

class VegetationBurnPointsDto {
    @ApiProperty({ description: 'Number of vegetation burn points within half a mile', type: Number })
    half_mile: number;

    @ApiProperty({ description: 'Number of vegetation burn points within one mile', type: Number })
    one_mile: number;
}

class MunicipalBoundaryDto {
    @ApiProperty({ description: 'Name of the boundary', type: String })
    namelsad: string;

    @ApiProperty({ description: 'Place FP code', type: String })
    placefp: string;

    @ApiProperty({ description: 'Type of the place', type: String })
    type: string;

    @ApiProperty({ description: 'Geographic ID', type: String })
    gid: string;
}

class UrbanicityDto {
    @ApiProperty({ description: 'Type of urbanicity', type: String })
    type: string;

    @ApiProperty({ description: 'Name of the urban area', type: String })
    name: string;

    @ApiProperty({ description: 'Description of the urbanicity', type: String })
    desc: string;
}

class CensusBlockDto {
    @ApiProperty({ description: 'Geographic ID', type: String })
    geoid: string;

    @ApiProperty({ description: 'State FIPS code', type: String })
    state_fips_code: string;

    @ApiProperty({ description: 'County FIPS code', type: String })
    county_fips_code: string;

    @ApiProperty({ description: 'Census tract', type: String })
    tract: string;

    @ApiProperty({ description: 'Census block', type: String })
    block: string;

    @ApiProperty({ description: 'Block group', type: String })
    block_group: string;
}

class StateCountyDto {
    @ApiProperty({ description: 'State name', type: String })
    state: string;

    @ApiProperty({ description: 'County jurisdiction', type: String })
    jurisdiction: string;

    @ApiProperty({ description: 'State and county FIPS code', type: String })
    state_and_county_FIPS_code: string;
}

class EnhancedWildfireRiskDto {
    @ApiProperty({ description: 'Risk score', type: String })
    score: string;

    @ApiProperty({ description: 'Risk text description', type: String })
    text: string;

    @ApiProperty({ description: 'Risk scores object', type: RiskScoresDto })
    risk_scores: RiskScoresDto;

    @ApiProperty({ description: 'Landcover risk details', type: LandcoverRiskDto })
    landcover_risk: LandcoverRiskDto;

    @ApiProperty({ description: 'Katabatic wind risk details', type: KatabaticWindRiskDto })
    katabatic_wind_risk: KatabaticWindRiskDto;

    @ApiProperty({ description: 'Fire season precipitation risk details', type: FireSeasonPrecipRiskDto })
    fire_season_precip_risk: FireSeasonPrecipRiskDto;

    @ApiProperty({ description: 'Wildfire perimeter risk details', type: WildfirePerimeterRiskDto })
    wildfire_perimeter_risk: WildfirePerimeterRiskDto;

    @ApiProperty({ description: 'Vegetation burn site risk details', type: VegetationBurnSiteRiskDto })
    vegetation_burn_site_risk: VegetationBurnSiteRiskDto;
}

export class HazardhubLocationDto extends AddressDto {
    @ApiProperty({ description: 'Longitude of the location', type: String })
    longitude: string;

    @ApiProperty({ description: 'Latitude of the location', type: String })
    latitude: string;

    @ApiProperty({ description: 'Type of location', type: String })
    location_type: string;
}

export class HazardhubResponseDto {
    @ApiProperty({ description: 'Address of the location', type: HazardhubLocationDto })
    location: HazardhubLocationDto;

    @ApiProperty({ description: 'Level of match', type: String })
    match_level: string;

    @ApiProperty({ description: 'Type of match', type: String })
    match_type: string;

    @ApiProperty({ description: 'Match provider', type: String })
    match_provider: string;

    @ApiProperty({ description: 'Match score', type: Number })
    match_score: number;

    @ApiProperty({ description: 'Enhanced wildfire risk details', type: EnhancedWildfireRiskDto })
    enhanced_wildfire: EnhancedWildfireRiskDto;

    @ApiProperty({ description: 'Wildfire score details', type: WildfireDto })
    wildfire: WildfireDto;

    @ApiProperty({ description: 'Additional wildfire description', type: WildfireRiskScoreDto })
    wildfire_description: WildfireRiskScoreDto;

    @ApiProperty({ description: 'Wildfire risk score', type: WildfireRiskScoreDto })
    wildfire_risk_score: WildfireRiskScoreDto;

    @ApiProperty({ description: 'Wildfire risk text', type: WildfireDto })
    wildfire_risk: WildfireDto;

    @ApiProperty({ description: 'Additional drought details', type: DroughtDto })
    drought: DroughtDto;

    @ApiProperty({ description: 'Drought frequency index details', type: DroughtFrequencyIndexDto })
    drought_frequency_index: DroughtFrequencyIndexDto;

    @ApiProperty({ description: 'Wildfire history parameters', type: WildfireHistoryParamsDto })
    wildfire_history_params: WildfireHistoryParamsDto;

    @ApiProperty({
        description: 'Distance to significant wildfire risk parameters',
        type: DistanceToSignificantWfRiskParamsDto,
    })
    distance_to_significant_wf_risk_params: DistanceToSignificantWfRiskParamsDto;

    @ApiProperty({ description: 'Fire season precipitation parameters', type: FireSeasonPrecipitationParamsDto })
    fire_season_precipitation_params: FireSeasonPrecipitationParamsDto;

    @ApiProperty({ description: 'Vegetation burn points', type: VegetationBurnPointsDto })
    vegetation_burn_points: VegetationBurnPointsDto;

    @ApiProperty({ description: 'Municipal boundaries', type: MunicipalBoundaryDto })
    municipal_boundary: MunicipalBoundaryDto;

    @ApiProperty({ description: 'Urbanicity details', type: UrbanicityDto })
    urbanicity: UrbanicityDto;

    @ApiProperty({ description: 'Census block details', type: CensusBlockDto })
    census_block: CensusBlockDto;

    @ApiProperty({ description: 'State and county details', type: StateCountyDto })
    state_county: StateCountyDto;
}
