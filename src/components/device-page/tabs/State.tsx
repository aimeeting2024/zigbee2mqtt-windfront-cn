import { useShallow } from "zustand/react/shallow";
import { getSemanticLabel } from "../../../semanticLabels.js";
import { useAppStore } from "../../../store.js";
import DisplayValue from "../../value-decorators/DisplayValue.js";
import Json from "../../value-decorators/Json.js";

type StatesProps = {
    sourceIdx: number;
    friendlyName: string;
};

export default function State({ sourceIdx, friendlyName }: StatesProps) {
    const deviceState = useAppStore(useShallow((state) => state.deviceStates[sourceIdx][friendlyName]));
    const entries = Object.entries(deviceState ?? {}).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

    return (
        <div className="flex flex-col gap-4">
            <div className="overflow-x-auto">
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th>中文字段</th>
                            <th>原始字段</th>
                            <th>当前值</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map(([key, value]) => {
                            const semantic = getSemanticLabel(key);

                            return (
                                <tr key={key}>
                                    <td>
                                        <div className="font-medium">{semantic.label}</div>
                                        {semantic.description && <div className="text-xs opacity-60">{semantic.description}</div>}
                                    </td>
                                    <td className="font-mono text-xs opacity-70">{semantic.originalKey}</td>
                                    <td>
                                        <DisplayValue value={value} name={key} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <details className="collapse collapse-arrow bg-base-100 border border-base-300">
                <summary className="collapse-title font-semibold">原始状态 JSON</summary>
                <div className="collapse-content">
                    <Json obj={deviceState ?? {}} />
                </div>
            </details>
        </div>
    );
}
