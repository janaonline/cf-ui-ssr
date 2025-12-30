import 'chart.js';
import { ChartType } from 'chart.js';

declare module 'chart.js' {
    interface PluginOptionsByType<TType extends ChartType> {
        /* Existing custom plugin */
        customDataLabel?: {
            enabled: boolean;
            format: string;
        };

        /* Doughnut center text plugin */
        centerText?: {
            text?: string | number;
        };
    }
}
