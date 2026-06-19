import {
    faBolt,
    faCircleInfo,
    faClockRotateLeft,
    faMagnifyingGlass,
    faPen,
    faPlugCircleBolt,
    faRotate,
    faSignal,
    faTrashCan,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import Button from "../components/Button.js";
import ConfirmButton from "../components/ConfirmButton.js";
import SourceDot from "../components/SourceDot.js";
import Countdown from "../components/value-decorators/Countdown.js";
import { NavBarContent } from "../layout/NavBarContext.js";
import { API_NAMES, API_URLS, useAppStore } from "../store.js";
import type { Device, DeviceState, LogMessage } from "../types.js";
import { sendMessage } from "../websocket/WebSocketManager.js";

const SOURCE_IDX = 0;
const RECENT_LOG_LIMIT = 8;

type MobileDeviceRowProps = {
    device: Device;
    state: DeviceState | undefined;
    log?: LogMessage;
};

const formatValue = (value: unknown): string => {
    if (value === undefined || value === null || value === "") {
        return "-";
    }

    if (typeof value === "object") {
        try {
            return JSON.stringify(value);
        } catch {
            return "-";
        }
    }

    return String(value);
};

const getAvailability = (device: Device, state: DeviceState | undefined): "online" | "offline" | "unknown" => {
    if (device.disabled) {
        return "offline";
    }

    if (state?.last_seen || state?.linkquality !== undefined) {
        return "online";
    }

    return "unknown";
};

const getAvailabilityClassName = (availability: ReturnType<typeof getAvailability>): string => {
    switch (availability) {
        case "online":
            return "badge-success";
        case "offline":
            return "badge-error";
        default:
            return "badge-warning";
    }
};

const MobileDeviceRow = memo(({ device, state, log }: MobileDeviceRowProps) => {
    const [renameValue, setRenameValue] = useState(device.friendly_name);
    const [showDetails, setShowDetails] = useState(false);
    const availability = getAvailability(device, state);
    const lqi = device.interviewing ? undefined : state?.linkquality;
    const battery = state?.battery;

    const onRename = async () => {
        const trimmed = renameValue.trim();

        if (!trimmed || trimmed === device.friendly_name) {
            return;
        }

        await sendMessage(SOURCE_IDX, "bridge/request/device/rename", {
            last: false,
            from: device.friendly_name,
            to: trimmed,
            homeassistant_rename: false,
        });
    };

    const onInterview = async () => {
        await sendMessage(SOURCE_IDX, "bridge/request/device/interview", { id: device.friendly_name });
    };

    const onRemove = async () => {
        await sendMessage(SOURCE_IDX, "bridge/request/device/remove", { id: device.friendly_name, force: false });
    };

    return (
        <article className="rounded-lg border border-base-300 bg-base-100 p-3 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="avatar placeholder">
                    <div className="bg-base-200 text-base-content rounded-full w-11">
                        <FontAwesomeIcon icon={device.type === "Coordinator" ? faCircleInfo : faPlugCircleBolt} />
                    </div>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold truncate">{device.friendly_name}</h2>
                        <span className={`badge badge-xs ${getAvailabilityClassName(availability)}`}>{availability}</span>
                    </div>
                    <p className="text-xs text-base-content/60 truncate">
                        {device.definition?.vendor ?? "未知厂商"} / {device.definition?.model ?? device.ieee_address}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="badge badge-outline gap-1">
                            <FontAwesomeIcon icon={faSignal} />
                            LQI {formatValue(lqi)}
                        </span>
                        <span className="badge badge-outline gap-1">
                            <FontAwesomeIcon icon={faBolt} />
                            {formatValue(battery)}%
                        </span>
                        <span className="badge badge-outline">{device.type}</span>
                    </div>
                </div>
                <Button<boolean> item={!showDetails} onClick={setShowDetails} className="btn btn-sm btn-ghost btn-square" title="详情">
                    <FontAwesomeIcon icon={faCircleInfo} />
                </Button>
            </div>

            {showDetails && (
                <div className="mt-3 space-y-3">
                    <div className="join w-full">
                        <label className="input input-sm join-item flex-1 min-w-0">
                            <FontAwesomeIcon icon={faPen} />
                            <input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} />
                        </label>
                        <Button<void>
                            onClick={onRename}
                            className="btn btn-sm btn-primary join-item"
                            disabled={renameValue.trim() === device.friendly_name}
                        >
                            保存
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <ConfirmButton<void>
                            onClick={onInterview}
                            className="btn btn-sm btn-outline btn-primary"
                            title="重新访谈"
                            modalDescription={`重新访谈 ${device.friendly_name}？`}
                            modalCancelLabel="取消"
                        >
                            <FontAwesomeIcon icon={faRotate} />
                            访谈
                        </ConfirmButton>
                        <ConfirmButton<void>
                            onClick={onRemove}
                            className="btn btn-sm btn-outline btn-error"
                            title="移除设备"
                            modalDescription={`从 Zigbee2MQTT 移除 ${device.friendly_name}？`}
                            modalCancelLabel="取消"
                        >
                            <FontAwesomeIcon icon={faTrashCan} />
                            移除
                        </ConfirmButton>
                    </div>

                    <div className="rounded-md bg-base-200 p-2 text-xs text-base-content/70">
                        <div className="grid grid-cols-[5rem_1fr] gap-x-2 gap-y-1">
                            <span>IEEE</span>
                            <span className="break-all">{device.ieee_address}</span>
                            <span>网络地址</span>
                            <span>{device.network_address}</span>
                            <span>最后出现</span>
                            <span>{formatValue(state?.last_seen)}</span>
                            <span>最近日志</span>
                            <span className="line-clamp-2">{log?.message ?? "暂无"}</span>
                        </div>
                    </div>
                </div>
            )}
        </article>
    );
});

export default function MobileOpsPage() {
    const [query, setQuery] = useState("");
    const { devices, deviceStates, bridgeInfo, bridgeState, bridgeHealth, logs, readyStates } = useAppStore(
        useShallow((state) => ({
            devices: state.devices[SOURCE_IDX],
            deviceStates: state.deviceStates[SOURCE_IDX],
            bridgeInfo: state.bridgeInfo[SOURCE_IDX],
            bridgeState: state.bridgeState[SOURCE_IDX],
            bridgeHealth: state.bridgeHealth[SOURCE_IDX],
            logs: state.logs[SOURCE_IDX],
            readyStates: state.readyStates,
        })),
    );

    const visibleDevices = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return devices
            .filter((device) => device.type !== "Coordinator")
            .filter((device) => {
                if (!normalizedQuery) {
                    return true;
                }

                return [device.friendly_name, device.ieee_address, device.definition?.vendor, device.definition?.model]
                    .filter(Boolean)
                    .some((value) => value!.toLowerCase().includes(normalizedQuery));
            })
            .sort((left, right) => left.friendly_name.localeCompare(right.friendly_name));
    }, [devices, query]);

    const offlineCount = useMemo(
        () => visibleDevices.filter((device) => getAvailability(device, deviceStates[device.friendly_name]) !== "online").length,
        [deviceStates, visibleDevices],
    );

    const recentLogs = useMemo(() => logs.slice(-RECENT_LOG_LIMIT).reverse(), [logs]);
    const logByDevice = useMemo(() => {
        const result = new Map<string, LogMessage>();

        for (let idx = logs.length - 1; idx >= 0; idx--) {
            const log = logs[idx];

            for (const device of devices) {
                if (!result.has(device.friendly_name) && log.message.includes(device.friendly_name)) {
                    result.set(device.friendly_name, log);
                }
            }
        }

        return result;
    }, [devices, logs]);

    const permitJoin = bridgeInfo.permit_join;
    const permitJoinEnd = bridgeInfo.permit_join_end;

    const onTogglePermitJoin = async () => {
        await sendMessage(SOURCE_IDX, "bridge/request/permit_join", { time: permitJoin ? 0 : 120 });
    };

    const onRestart = async () => {
        await sendMessage(SOURCE_IDX, "bridge/request/restart", "");
    };

    return (
        <>
            <NavBarContent>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <SourceDot idx={SOURCE_IDX} />
                    <div className="min-w-0">
                        <div className="font-semibold leading-tight">移动运维</div>
                        <div className="text-xs text-base-content/60 truncate">{API_NAMES[SOURCE_IDX] ?? API_URLS[SOURCE_IDX]}</div>
                    </div>
                </div>
            </NavBarContent>

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 pb-20">
                <section className="rounded-lg bg-base-100 p-3 shadow-sm border border-base-300">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-lg font-semibold">Zigbee2MQTT 现场运维</h1>
                            <p className="text-sm text-base-content/60">用于手机快速配网、排障和设备验收。</p>
                        </div>
                        <div className={`badge ${readyStates[SOURCE_IDX] === WebSocket.OPEN ? "badge-success" : "badge-error"}`}>
                            {bridgeState.state}
                        </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="stat rounded-md bg-base-200 p-3">
                            <div className="stat-title text-xs">设备</div>
                            <div className="stat-value text-xl">{visibleDevices.length}</div>
                        </div>
                        <div className="stat rounded-md bg-base-200 p-3">
                            <div className="stat-title text-xs">异常</div>
                            <div className="stat-value text-xl">{offlineCount}</div>
                        </div>
                        <div className="stat rounded-md bg-base-200 p-3">
                            <div className="stat-title text-xs">MQTT</div>
                            <div className="stat-value text-xl">{bridgeHealth.mqtt.connected ? "正常" : "断开"}</div>
                        </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button<void> onClick={onTogglePermitJoin} className={`btn ${permitJoin ? "btn-success" : "btn-primary"}`}>
                            <FontAwesomeIcon icon={faPlugCircleBolt} />
                            {permitJoin ? "关闭入网" : "允许入网"}
                            {permitJoin && permitJoinEnd ? <Countdown seconds={(permitJoinEnd - Date.now()) / 1000} hideZeroes /> : null}
                        </Button>
                        <ConfirmButton<void>
                            onClick={onRestart}
                            className="btn btn-outline btn-warning"
                            title="重启服务"
                            modalDescription="确定要重启 Zigbee2MQTT？现场操作会短暂中断。"
                            modalCancelLabel="取消"
                        >
                            <FontAwesomeIcon icon={faRotate} />
                            重启
                        </ConfirmButton>
                    </div>
                </section>

                <label className="input input-bordered flex items-center gap-2">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                    <input
                        className="grow"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="搜索名称、型号、厂商或 IEEE 地址"
                    />
                </label>

                <section className="flex flex-col gap-2">
                    {visibleDevices.map((device) => (
                        <MobileDeviceRow
                            key={device.ieee_address}
                            device={device}
                            state={deviceStates[device.friendly_name]}
                            log={logByDevice.get(device.friendly_name)}
                        />
                    ))}
                    {visibleDevices.length === 0 && (
                        <div className="rounded-lg border border-dashed border-base-300 p-6 text-center text-sm text-base-content/60">
                            没有匹配设备
                        </div>
                    )}
                </section>

                <section className="rounded-lg border border-base-300 bg-base-100 p-3 shadow-sm">
                    <h2 className="flex items-center gap-2 font-semibold">
                        <FontAwesomeIcon icon={faClockRotateLeft} />
                        最近日志
                    </h2>
                    <div className="mt-2 flex flex-col gap-2">
                        {recentLogs.map((log, idx) => (
                            <div
                                // biome-ignore lint/suspicious/noArrayIndexKey: log messages may be duplicated
                                key={`${log.timestamp}-${idx}`}
                                className={`rounded-md p-2 text-xs ${
                                    log.level === "error"
                                        ? "bg-error/15 text-error"
                                        : log.level === "warning"
                                          ? "bg-warning/15 text-warning"
                                          : "bg-base-200"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {log.level === "error" || log.level === "warning" ? <FontAwesomeIcon icon={faTriangleExclamation} /> : null}
                                    <span>{log.timestamp}</span>
                                    <span className="badge badge-xs">{log.level}</span>
                                </div>
                                <p className="mt-1 break-words">{log.message}</p>
                            </div>
                        ))}
                        {recentLogs.length === 0 && <p className="text-sm text-base-content/60">暂无日志</p>}
                    </div>
                </section>
            </div>
        </>
    );
}
