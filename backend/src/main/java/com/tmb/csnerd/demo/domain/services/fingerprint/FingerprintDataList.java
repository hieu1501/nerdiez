package com.tmb.csnerd.demo.domain.services.fingerprint;

import java.util.List;

public record FingerprintDataList(
    String representation,
    List<IFingerprintData> items
) implements IFingerprintData {
}
