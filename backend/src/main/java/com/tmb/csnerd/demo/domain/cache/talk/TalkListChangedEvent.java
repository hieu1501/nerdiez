package com.tmb.csnerd.demo.domain.cache.talk;

import java.util.Set;

public record TalkListChangedEvent(Set<Long> talkIds) { }
