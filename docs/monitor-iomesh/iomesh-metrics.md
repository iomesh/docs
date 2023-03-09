---
id: iomesh-metrics
title: IOMesh Metrics
sidebar_label: IOMesh Metrics
---

## IOMesh Metrics

Before monitoring IOMesh storage, you should understand IOMesh metrics which can be interpreted from the chunk, cluster, or volume level.

### Chunk Metrics

**Chunk Status**

| Metrics | Description |
| --- | --- |
| `zbs_chunk_use_state` |  Shows chunk use state.|
| `zbs_chunk_connect_status` | Shows chunk server status. |
| `zbs_chunk_maintenance_mode` | Shows if chunk is in maintenance mode. |

**Chunk IO**

| Metrics | Description |
| --- | --- |
| `zbs_chunk_read_iops` | Shows chunk read IOPS. |
| `zbs_chunk_read_speed_bps` | Shows chunk read speed. |
| `zbs_chunk_avg_read_size_bytes` | read avg request size 啥啥啥啥啥啥啥|
| `zbs_chunk_avg_read_latency_ns` | Shows chunk read latency. |
| `zbs_chunk_write_iops` | Shows chunk write IOPS. |
| `zbs_chunk_write_speed_bps` | Shows chunk write speed. speed 和前面的有啥啥啥啥不同 |
| `zbs_chunk_avg_write_size_bytes` | write avg request size 这个也也也也也不知道 |
| `zbs_chunk_avg_write_latency_ns` | Shows chunk write latency. |
| `zbs_chunk_readwrite_iops` | Shows chunk read/write IOPS. |
| `zbs_chunk_readwrite_speed_bps` | Shows chunk read/write speed. |
| `zbs_chunk_avg_readwrite_size_bytes` | read write avg request size 也也也需要了解一下 |
| `zbs_chunk_avg_readwrite_latency_ns` | Shows chunk read/write latency. |

**Chunk Cache**
| Metrics | Description |
| --- | --- |
| `zbs_chunk_used_cache_space_bytes` | Shows the amount of used cache space. |
| `zbs_chunk_cache_capacity_bytes` | Shows the total amount of cache space. |
| `zbs_chunk_read_cache_hit_ratio` | Shows read cache hit ratio. |
| `zbs_chunk_write_cache_hit_ratio` | Shows write cache hit ratio. |
| `zbs_chunk_readwrite_cache_hit_ratio` | SHows read/write cache hit ratio. |
| `zbs_chunk_dirty_cache_ratio` | dirty cache ratio 只查查查到了 dirty background ratio |
| `zbs_chunk_dirty_cache_space_bytes` | Shows the amount of dirty cache space.|
| `zbs_chunk_valid_cache_space_bytes` | Shows the amount of valid cache space.|
| `zbs_chunk_failure_cache_space_bytes` | Shows the amount of failed cache space. |

**Chunk Data**
| Metrics | Description |
| --- | --- |
| `zbs_chunk_used_data_space_bytes` | Shows the amount of used data space.|
| `zbs_chunk_data_capacity_bytes` | Shows the total amount of data space. |
| `zbs_chunk_provisioned_data_space_bytes` | Shows the amount of provisioned data space.|
| `zbs_chunk_data_space_use_rate` | max(provisioned space, used space) / valid data space |
| `zbs_chunk_valid_data_space_bytes` | Shows the amount of valid data space. |
| `zbs_chunk_failure_data_space_bytes` | Shows the amount of failed data space.|

**Chuck Temporary Replica**
| Metrics | Description |
| --- | --- |
| `zbs_chunk_temporary_replica_space_bytes` | Shows the amount of space used by temporary replicas.|
| `zbs_chunk_temporary_replica_num` | Shows the number of temporary replicas.|

**Chunk Migration & Recovery**

| Metrics | Description |
| --- | --- |
| `zbs_chunk_pending_migrate_bytes` | pending migrate |
| `zbs_chunk_pending_recover_bytes` | pending recover |
| `zbs_chunk_recover_speed_bps` | recover speed |
| `zbs_chunk_migrate_speed_bps` | migrate speed |
| `zbs_chunk_recover_migrate_speed_bps` | recover + migrate speed |

### Cluster Metrics

**`Cluster License**

| Metrics | Description |
| --- | --- |
| `zbs_cluster_license_maintenance_already_expire` | Shows if maintenance already expire 这里的 maintenance 是指啥 |
| `zbs_cluster_license_already_expire` | if license already expire 是不是 IOMesh 的 license |
| `zbs_cluster_license_expire_day` | license expire day |
| `zbs_cluster_license_subscription_expire_day` | subscription expire day |
| `zbs_cluster_license_capacity_rate` | data capacity / license limit |
| `zbs_cluster_license_subscription_already_expire` | if subscription already expire |
| `zbs_cluster_license_maintenance_expire_day` | maintenance expire day |

**Cluster IO**

| Metrics | Description |
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
| zbs_cluster_temporary_replica_space_bytes | cluster temporary replica space used |
| zbs_cluster_temporary_replica_num | cluster temporary replica num |

### cluster:migrate&recover

| metrics name | describe |
| --- | --- |
| `zbs_cluster_pending_migrate_bytes` | pending migrate |
| `zbs_cluster_pending_recover_bytes` | pending recover |
| `zbs_cluster_migrate_speed_bps` | migrate speed |
| `zbs_cluster_recover_speed_bps` | recover speed |
| `zbs_cluster_recover_migrate_speed_bps` | recover + migrate speed |

### Volume Metrics

**Volume Space**

| Metrics | Description |
| --- | --- |
| `zbs_volume_shared_logical_size_bytes` | Shows the size of shared logical space.|
| `zbs_volume_unique_logical_size_bytes` | unique logical size 啥是 unique,独占？ |
| `zbs_volume_logical_size_bytes` | Shows the total size of logical space.|

**Volume IO**
| Metrics | Description|    
| --- | --- |
| `zbs_volume_readwrite_latency_ns` | Shows the read/write latency for a volume. 是一个 volume 吗|
| `zbs_volume_readwrite_speed_bps` | Shows the volume read/write speed.|
| `zbs_volume_readwrite_size_bytes` | readwrite size of volue |
| `zbs_volume_readwrite_iops` | readwrite_iops of volume |
| `zbs_volume_readwrite_iop30s` | readwrite_iop30s of volume |
| `zbs_volume_read_latency_ns` | read_latency_ns of volume |
| `zbs_volume_read_speed_bps` | read_speed_bps of volume |
| `zbs_volume_read_size_bytes` | read size of volume |
| `zbs_volume_read_iops` | read_iops of volume |
| `zbs_volume_write_latency_ns` | write_latency_ns of volume |
| `zbs_volume_write_speed_bps` | write_speed_bps of volume |
| `zbs_volume_write_size_bytes` | write size of volume |
| `zbs_volume_write_iops` | write_iops of volume |
| `zbs_volume_avg_iodepth` | average io depth of volume |
| `zbs_volume_ioctx_read_iops` | read_iops in io context of volume |
| `zbs_volume_ioctx_read_speed_bps` | read_speed_bps in io context of volume |
| `zbs_volume_ioctx_read_latency_ns` | read_latency_ns in io context of volume |
| `zbs_volume_ioctx_write_iops` | write_iops in io context of volume |
| `zbs_volume_ioctx_write_speed_bps` | write_speed_bps in io context of volume |
| `zbs_volume_ioctx_write_latency_ns` | write_latency_ns in io context of volume |
| `zbs_volume_ioctx_readwrite_iops` | readwrite_iops in io context of volume |
| `zbs_volume_ioctx_readwrite_speed_bps` | readwrite_speed_bps in io context of volume |
| `zbs_volume_ioctx_readwrite_latency_ns` | readwrite_latency_ns in io context of volume |
| `zbs_volume_ioctx_local_read_iops` | local_read_iops in io context of volume |
| `zbs_volume_ioctx_local_read_speed_bps` | local_read_speed_bps in io context of volume |
| `zbs_volume_ioctx_local_read_latency_ns` | local_read_latency_ns in io context of volume |
| `zbs_volume_ioctx_local_write_iops` | local_write_iops in io context of volume |
| `zbs_volume_ioctx_local_write_speed_bps` | local_write_speed_bps in io context of volume |
| `zbs_volume_ioctx_local_write_latency_ns` | local_write_latency_ns in io context of volume |
| `zbs_volume_ioctx_local_readwrite_iops` | local_readwrite_iops in io context of volume |
| `zbs_volume_ioctx_local_readwrite_speed_bps` | local_readwrite_speed_bps in io context of volume |
| `zbs_volume_ioctx_local_readwrite_latency_ns` | local_readwrite_latency_ns in io context of volume |
