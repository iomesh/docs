---
id: metrics
title: Metrics
sidebar_label: Metrics
---

IOMesh provide Prometheus format metrics data.

Checkout [Monitoring](../iomesh-operations/monitoring.md) to enable the metrics exporter.

## chunk

### chunk:stats

| metrics name | describe |
| --- | --- |
| `zbs_chunk_use_state` | chunk use state |
| `zbs_chunk_connect_status` | chunk server status |
| `zbs_chunk_maintenance_mode` | if chunk in maintenance mode |

### chunk:io

| metrics name | describe |
| --- | --- |
| `zbs_chunk_read_iops` | read iops |
| `zbs_chunk_read_speed_bps` | read speed |
| `zbs_chunk_avg_read_size_bytes` | read avg request size |
| `zbs_chunk_avg_read_latency_ns` | read latency |
| `zbs_chunk_write_iops` | write iops |
| `zbs_chunk_write_speed_bps` | write speed |
| `zbs_chunk_avg_write_size_bytes` | write avg request size |
| `zbs_chunk_avg_write_latency_ns` | write latency |
| `zbs_chunk_readwrite_iops` | read write iops |
| `zbs_chunk_readwrite_speed_bps` | read write speed |
| `zbs_chunk_avg_readwrite_size_bytes` | read write avg request size |
| `zbs_chunk_avg_readwrite_latency_ns` | read write latency |

### chunk:cache

| metrics name | describe |
| --- | --- |
| `zbs_chunk_used_cache_space_bytes` | the used cache space |
| `zbs_chunk_cache_capacity_bytes` | total cache capacity |
| `zbs_chunk_read_cache_hit_ratio` | read cache hit ratio |
| `zbs_chunk_write_cache_hit_ratio` | write cache hit ratio |
| `zbs_chunk_readwrite_cache_hit_ratio` | read write cache hit ratio |
| `zbs_chunk_dirty_cache_ratio` | dirty cache ratio |
| `zbs_chunk_dirty_cache_space_bytes` | the dirty cache space |
| `zbs_chunk_valid_cache_space_bytes` | the valid cache space |
| `zbs_chunk_failure_cache_space_bytes` | the failure cache space |

### chunk:space size

| metrics name | describe |
| --- | --- |
| `zbs_chunk_used_data_space_bytes` | the used data space |
| `zbs_chunk_data_capacity_bytes` | total data capacity |
| `zbs_chunk_provisioned_data_space_bytes` | the provisioned data space |
| `zbs_chunk_data_space_use_rate` | max(provisioned space, used space) / valid data space |
| `zbs_chunk_valid_data_space_bytes` | the valid data space |
| `zbs_chunk_failure_data_space_bytes` | the failure data space |

### chunk:migrate&recover

| metrics name | describe |
| --- | --- |
| `zbs_chunk_pending_migrate_bytes` | pending migrate |
| `zbs_chunk_pending_recover_bytes` | pending recover |
| `zbs_chunk_recover_speed_bps` | recover speed |
| `zbs_chunk_migrate_speed_bps` | migrate speed |
| `zbs_chunk_recover_migrate_speed_bps` | recover + migrate speed |

## cluster

### cluster:license

| metrics name | describe |
| --- | --- |
| `zbs_cluster_license_maintenance_already_expire` | if maintenance already expire |
| `zbs_cluster_license_already_expire` | if license already expire |
| `zbs_cluster_license_expire_day` | license expire day |
| `zbs_cluster_license_subscription_expire_day` | subscription expire day |
| `zbs_cluster_license_capacity_rate` | data capacity / license limit |
| `zbs_cluster_license_subscription_already_expire` | if subscription already expire |
| `zbs_cluster_license_maintenance_expire_day` | maintenance expire day |

### cluster:io

| metrics name | describe |
| --- | --- |
| `zbs_cluster_read_iops` | read iops |
| `zbs_cluster_readwrite_iops` | read write iops |
| `zbs_cluster_write_iops` | write iops |
| `zbs_cluster_read_speed_bps` | read speed |
| `zbs_cluster_write_speed_bps` | write speed |
| `zbs_cluster_readwrite_speed_bps` | read write speed |
| `zbs_cluster_avg_readwrite_latency_ns` | read write latency |
| `zbs_cluster_avg_write_latency_ns` | write latency |
| `zbs_cluster_avg_read_latency_ns` | read latency |
| `zbs_cluster_avg_write_size_bytes` | write avg request size |
| `zbs_cluster_avg_read_size_bytes` | read avg request size |
| `zbs_cluster_avg_readwrite_size_bytes` | read write avg request size |

### cluster:cache

| metrics name | describe |
| --- | --- |
| `zbs_cluster_write_cache_hit_ratio` | write cache hit ratio |
| `zbs_cluster_failure_cache_space_bytes` | the failure cache space |
| `zbs_cluster_cache_capacity_bytes` | total cache capacity |
| `zbs_cluster_dirty_cache_space_bytes` | the dirty cache space |
| `zbs_cluster_readwrite_cache_hit_ratio` | read write cache hit ratio |
| `zbs_cluster_used_cache_space_bytes` | the used cache space |
| `zbs_cluster_valid_cache_space_bytes` | the valid cache space |
| `zbs_cluster_dirty_cache_ratio` | dirty cache ratio |
| `zbs_cluster_read_cache_hit_ratio` | read cache hit ratio |

### cluster:space size

| metrics name | describe |
| --- | --- |
| `zbs_cluster_data_capacity_bytes` | total data capacity |
| `zbs_cluster_data_space_use_rate` | max(provisioned space, used space) / valid data space |
| `zbs_cluster_unique_logical_size_bytes` | unique logical size |
| `zbs_cluster_shared_logical_size_bytes` | shared logical size |
| `zbs_cluster_logical_size_bytes` | total logical size |
| `zbs_cluster_valid_data_space_bytes` | the valid data space |
| `zbs_cluster_used_data_space_bytes` | the used data space |
| `zbs_cluster_failure_data_space_bytes` | the failure data space |
| `zbs_cluster_provisioned_data_space_bytes` | the provisioned data space |
| `zbs_cluster_chunks_unsafe_failure_space` | chunks whose used space is larger than cluster unused space |
| `zbs_cluster_zone_space_diff_proportion` | zone space diff quotient cluster total spaces |

### cluster:migrate&recover

| metrics name | describe |
| --- | --- |
| `zbs_cluster_pending_migrate_bytes` | pending migrate |
| `zbs_cluster_pending_recover_bytes` | pending recover |
| `zbs_cluster_migrate_speed_bps` | migrate speed |
| `zbs_cluster_recover_speed_bps` | recover speed |
| `zbs_cluster_recover_migrate_speed_bps` | recover + migrate speed |

## volume

### volume:io

| metrics name | describe |
| --- | --- |
| `zbs_volume_shared_logical_size_bytes` | shared logical size |
| `zbs_volume_unique_logical_size_bytes` | unique logical size |
| `zbs_volume_logical_size_bytes` | total logical size |
| `zbs_volume_readwrite_latency_ns` | readwrite_latency_ns of volume |
| `zbs_volume_readwrite_speed_bps` | readwrite_speed_bps of volume |
| `zbs_volume_readwrite_iop30s` | readwrite_iop30s of volume |
| `zbs_volume_write_speed_bps` | write_speed_bps of volume |
| `zbs_volume_read_iops` | read_iops of volume |
| `zbs_volume_readwrite_iops` | readwrite_iops of volume |
| `zbs_volume_write_latency_ns` | write_latency_ns of volume |
| `zbs_volume_read_speed_bps` | read_speed_bps of volume |
| `zbs_volume_read_latency_ns` | read_latency_ns of volume |
| `zbs_volume_write_iops` | write_iops of volume |