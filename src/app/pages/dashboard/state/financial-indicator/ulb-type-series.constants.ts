/**
 * Single source of truth for the ULB types shown in the State Dashboard
 * Financial Indicator charts (scatter chart + mix/doughnut chart).
 *
 * - label:      Display label / full-name string. Used as the scatter series
 *               `label`, matched against in ChartService#setScatterData's
 *               `el.label` chain, and used as the full-string key for the
 *               'ulbTypeAvg' compare-category branch in
 *               ChartService#setCompareCategoryData (e.g. apiData['Municipal Corporation']).
 * - defaultKey: Property name read off the "default" (non state-service-label)
 *               API response shape, e.g. apiData['mCorporation'].
 * - slbKey:     Property name read off the state-service-label API response
 *               shape, e.g. apiData['scatterData']['mc_data'].
 * - compareKey: Property name used by MixChart's `types.ulbType` entries
 *               (and the corresponding key on the doughnut-chart response data).
 * - color:      Border/background color for this type's scatter series in
 *               ChartService#initializeScatterData.
 */
export interface UlbTypeSeries {
  label: string;
  defaultKey: string;
  slbKey: string;
  compareKey: string;
  color: string;
}

export const ULB_TYPE_SERIES: UlbTypeSeries[] = [
  { label: 'Municipality', defaultKey: 'municipality', slbKey: 'm_data', compareKey: 'mData', color: '#1EBFC6' },
  { label: 'Municipal Corporation', defaultKey: 'mCorporation', slbKey: 'mc_data', compareKey: 'mcData', color: '#3E5DB1' },
  { label: 'Town Panchayat', defaultKey: 'townPanchayat', slbKey: 'tp_data', compareKey: 'tpData', color: '#F5B742' },
  { label: 'Cantonment Board', defaultKey: 'cantonmentBoard', slbKey: 'cb_data', compareKey: 'cbData', color: '#8B5CF6' },
];
