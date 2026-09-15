package com.tmb.csnerd.demo.utils;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class PageableUtils {
    public Integer getSafePageNumber(Integer pageNumber) {
        return Math.max(pageNumber, 0);
    }

    public Integer getSafePageSize(Integer pageSize, Integer maxPageSize) {

        return Math.clamp(pageSize, 1, maxPageSize);
    }

    public Sort getSafeSort(Sort sort, Set<String> allowedSortFields, String tiebreaker) {
        if (allowedSortFields == null || allowedSortFields.isEmpty()) {
            throw new IllegalArgumentException("Sort fields is empty for pagination");
        }
        if (sort.isUnsorted()) {
            return Sort.by(Sort.Direction.DESC, allowedSortFields.iterator().next()).and(Sort.by(tiebreaker).ascending());
        }
        List<Sort.Order> validOrders = sort.stream()
                .filter(order -> allowedSortFields.contains(order.getProperty()))
                .toList();
        if (validOrders.size() != sort.stream().count()) {
            throw new IllegalArgumentException(
                sort.stream().map(Sort.Order::getProperty).filter(p -> !allowedSortFields.contains(p)).collect(Collectors.joining(", "))
            );
        }
        return Sort.by(validOrders).and(Sort.by(tiebreaker).ascending());
    }

    public List<String> getRepresentationForPage(String representation, Pageable pageable, Page<?> page){
        List<String> result = getRepresentationForSlice(representation, pageable, page);
        result.add("total-pages:" + page.getTotalPages());
        result.add("total-items:" + page.getTotalElements());
        return result;
    }

    public List<String> getRepresentationForSlice(String representation, Pageable pageable, Slice<?> slice) {
        return new ArrayList<>(List.of(
            representation,
            "size:" + slice.getSize(),
            "offset:" + pageable.getOffset(),
            "sort:" + pageable.getSort(),
            "has-next:" + slice.hasNext(),
            "has-previous:" + slice.hasPrevious(),
            "item-count:" + slice.getNumberOfElements()
        ));
    }
}
