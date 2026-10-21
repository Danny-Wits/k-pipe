package com.linuxpipe.kernel;

import java.util.List;

/**
 * Workload presets representing realistic Linux shell pipeline scenarios.
 */
public enum PipeScenario {
    CAT_GREP(
        "CAT_GREP",
        4102,
        "cat access.log",
        "write(pipefd[1], buf, 4096)",
        List.of(
            "192.168.1.10 - - [21/Oct/2026:14:02:10] \"GET /api/v1/auth HTTP/1.1\" 200 4520",
            "10.0.0.45 - - [21/Oct/2026:14:02:11] \"POST /checkout HTTP/1.1\" 500 1204",
            "172.16.0.22 - - [21/Oct/2026:14:02:12] \"GET /health HTTP/1.1\" 200 180",
            "192.168.2.89 - - [21/Oct/2026:14:02:13] \"POST /api/pay HTTP/1.1\" 500 890",
            "10.0.4.12 - - [21/Oct/2026:14:02:14] \"DELETE /session HTTP/1.1\" 204 0",
            "192.168.1.100 - - [21/Oct/2026:14:02:15] \"GET /images/logo.png HTTP/1.1\" 200 12500",
            "10.2.0.18 - - [21/Oct/2026:14:02:16] \"GET /metrics HTTP/1.1\" 200 8540",
            "192.168.1.55 - - [21/Oct/2026:14:02:17] \"PUT /api/v1/profile HTTP/1.1\" 500 240"
        ),
        4103,
        "grep 500",
        "read(pipefd[0], buf, 4096)"
    ),

    FFMPEG_X264(
        "FFMPEG_X264",
        5210,
        "ffmpeg -i stream.raw",
        "write(pipefd[1], frame, 4096)",
        List.of(
            "FRAME #00124 TYPE=I QP=18 YUV420p 1920x1080 PTS=41333 [NAL_UNIT_SPS]",
            "FRAME #00125 TYPE=P QP=22 YUV420p 1920x1080 PTS=41374 [NAL_SLICE_DATA]",
            "FRAME #00126 TYPE=B QP=24 YUV420p 1920x1080 PTS=41416 [NAL_SLICE_DATA]",
            "FRAME #00127 TYPE=B QP=24 YUV420p 1920x1080 PTS=41458 [NAL_SLICE_DATA]",
            "FRAME #00128 TYPE=P QP=21 YUV420p 1920x1080 PTS=41500 [NAL_SLICE_DATA]",
            "FRAME #00129 TYPE=I QP=19 YUV420p 1920x1080 PTS=41542 [NAL_UNIT_IDR]",
            "FRAME #00130 TYPE=P QP=23 YUV420p 1920x1080 PTS=41584 [NAL_SLICE_DATA]"
        ),
        5211,
        "x264",
        "read(pipefd[0], frame, 4096)"
    ),

    TAR_GZIP(
        "TAR_GZIP",
        6340,
        "tar -cf - /var/log",
        "write(pipefd[1], tar_blk, 4096)",
        List.of(
            "USTAR /var/log/syslog.1 SIZE=409600 MODE=0640 CHK=034112 [BLOCK 0x00]",
            "USTAR /var/log/auth.log SIZE=102400 MODE=0600 CHK=021440 [BLOCK 0x01]",
            "USTAR /var/log/nginx/access.log SIZE=819200 MODE=0644 CHK=051201 [BLOCK 0x02]",
            "USTAR /var/log/kern.log SIZE=204800 MODE=0640 CHK=012350 [BLOCK 0x03]",
            "USTAR /var/log/dpkg.log SIZE=512000 MODE=0644 CHK=044120 [BLOCK 0x04]",
            "USTAR /var/log/daemon.log SIZE=256000 MODE=0640 CHK=017830 [BLOCK 0x05]"
        ),
        6341,
        "gzip",
        "read(pipefd[0], tar_blk, 4096)"
    );

    private final String id;
    private final int producerPid;
    private final String producerName;
    private final String producerSyscall;
    private final List<String> samplePayloads;
    private final int consumerPid;
    private final String consumerName;
    private final String consumerSyscall;

    PipeScenario(
        String id,
        int producerPid,
        String producerName,
        String producerSyscall,
        List<String> samplePayloads,
        int consumerPid,
        String consumerName,
        String consumerSyscall
    ) {
        this.id = id;
        this.producerPid = producerPid;
        this.producerName = producerName;
        this.producerSyscall = producerSyscall;
        this.samplePayloads = samplePayloads;
        this.consumerPid = consumerPid;
        this.consumerName = consumerName;
        this.consumerSyscall = consumerSyscall;
    }

    public static PipeScenario fromString(String name) {
        if (name == null || name.isBlank()) {
            return CAT_GREP;
        }
        for (PipeScenario s : values()) {
            if (s.id.equalsIgnoreCase(name) || s.name().equalsIgnoreCase(name)) {
                return s;
            }
        }
        return CAT_GREP;
    }

    public String getId() { return id; }
    public int getProducerPid() { return producerPid; }
    public String getProducerName() { return producerName; }
    public String getProducerSyscall() { return producerSyscall; }
    public List<String> getSamplePayloads() { return samplePayloads; }
    public int getConsumerPid() { return consumerPid; }
    public String getConsumerName() { return consumerName; }
    public String getConsumerSyscall() { return consumerSyscall; }
}
