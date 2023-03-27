---
id: iomesh-metrics
title: IOMesh Metrics
sidebar_label: IOMesh Metrics
---

IOMesh provides Prometheus format metrics to monitor IOMesh storage performance at the block, cluster or volume level.

### Chunk Metrics

**Chunk Status**

| Metrics | Description |
| --- | --- |
| `zbs_chunk_use_state` |  Chunk use state.|
| `zbs_chunk_connect_status` | Chunk server status. |
| `zbs_chunk_maintenance_mode` | Shows if chunk is in maintenance mode. |

**Chunk IO**

| Metrics | Description |
| --- | --- |
| `zbs_chunk_read_iops` | Chunk read IOPS. |
| `zbs_chunk_read_speed_bps` | Chunk read speed. |
| `zbs_chunk_avg_read_size_bytes` | Average read request size.|
| `zbs_chunk_avg_read_latency_ns` | The chunk read latency. |
| `zbs_chunk_write_iops` | The chunk write IOPS. |
| `zbs_chunk_write_speed_bps` | The chunk write speed.|
| `zbs_chunk_avg_write_size_bytes` |The average size of write request.|
| `zbs_chunk_avg_write_latency_ns` | The chunk write latency. |
| `zbs_chunk_readwrite_iops` | The chunk read write IOPS. |
| `zbs_chunk_readwrite_speed_bps` | The chunk read write speed. |
| `zbs_chunk_avg_readwrite_size_bytes` | The average size of chunk read write request.|
| `zbs_chunk_avg_readwrite_latency_ns` | The chunk read write latency. |

**Chunk Cache**
| Metrics | Description |
| --- | --- |
| `zbs_chunk_used_cache_space_bytes` | The amount of used cache space. |
| `zbs_chunk_cache_capacity_bytes` | The total amount of cache space. |
| `zbs_chunk_read_cache_hit_ratio` | Read cache hit ratio. |
| `zbs_chunk_write_cache_hit_ratio` | Write cache hit ratio. |
| `zbs_chunk_readwrite_cache_hit_ratio` | Read write cache hit ratio. |
| `zbs_chunk_dirty_cache_ratio` | Dirty cache ratio.|
| `zbs_chunk_dirty_cache_space_bytes` | The amount of dirty cache space.|
| `zbs_chunk_valid_cache_space_bytes` | The amount of valid cache space.|
| `zbs_chunk_failure_cache_space_bytes` | The amount of failed cache space. |

**Chunk Data**
| Metrics | Description |
| --- | --- |
| `zbs_chunk_used_data_space_bytes` | The amount of used data space.|
| `zbs_chunk_data_capacity_bytes` | The total amount of data space. |
| `zbs_chunk_provisioned_data_space_bytes` | The amount of provisioned data space.|
| `zbs_chunk_data_space_use_rate` | max(provisioned space, used space) / valid data space |
| `zbs_chunk_valid_data_space_bytes` | The amount of valid data space. |
| `zbs_chunk_failure_data_space_bytes` | The amount of failed data space.|

**Chunk Temporary Replica**
| Metrics | Description |
| --- | --- |
| `zbs_chunk_temporary_replica_space_bytes` | The amount of space consumed by temporary replicas.|
| `zbs_chunk_temporary_replica_num` | The number of temporary replicas.|

**Chunk Migration & Recovery**

| Metrics | Description |
| --- | --- |
| `zbs_chunk_pending_migrate_bytes` | The total amount of data to be migrated.|
| `zbs_chunk_pending_recover_bytes` | The total amount of data to be recovered. |
| `zbs_chunk_recover_speed_bps` | Recovery speed |
| `zbs_chunk_migrate_speed_bps` | Migration speed. |
| `zbs_chunk_recover_migrate_speed_bps` | Recovery & migration speed. |

### Cluster Metrics

**Cluster License**

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
| `zbs_cluster_read_iops` | Read IOPS. |
| `zbs_cluster_readwrite_iops` | Read write IOPS. |
| `zbs_cluster_write_iops` | Write IOPS. |
| `zbs_cluster_read_speed_bps` | Read speed. |
| `zbs_cluster_write_speed_bps` | Write speed. |
| `zbs_cluster_readwrite_speed_bps` | Read write speed. |
| `zbs_cluster_avg_readwrite_latency_ns` | Read write latency. |
| `zbs_cluster_avg_write_latency_ns` | Write latency. |
| `zbs_cluster_avg_read_latency_ns` | Read latency. |
| `zbs_cluster_avg_write_size_bytes` | Average write request size. |
| `zbs_cluster_avg_read_size_bytes` | Average write request size. |
| `zbs_cluster_avg_readwrite_size_bytes` | Average read write request size. |

**Cluster Cache**

| Metrics | Description |
| --- | --- |
| `zbs_cluster_write_cache_hit_ratio` | Write cache hit ratio. |
| `zbs_cluster_failure_cache_space_bytes` | The amount of failed cache space.|
| `zbs_cluster_cache_capacity_bytes` | Total cache capacity. |
| `zbs_cluster_dirty_cache_space_bytes` | Dirty cache space. |
| `zbs_cluster_readwrite_cache_hit_ratio` | Read write cache hit ratio. |
| `zbs_cluster_used_cache_space_bytes` | Used cache space. |
| `zbs_cluster_valid_cache_space_bytes` | Valid cache space. |
| `zbs_cluster_dirty_cache_ratio` | Dirty cache ratio.|
| `zbs_cluster_read_cache_hit_ratio` | Read cache hit ratio. |

**Cluster Space Size**

| Metrics | Description |
| --- | --- |
| `zbs_cluster_data_capacity_bytes` | Total data capacity. |
| `zbs_cluster_data_space_use_rate` | max(provisioned space, used space) / valid data space |
| `zbs_cluster_unique_logical_size_bytes` | unique logical size |
| `zbs_cluster_shared_logical_size_bytes` | shared logical size |
| `zbs_cluster_logical_size_bytes` | total logical size |
| `zbs_cluster_valid_data_space_bytes` | the valid data space |
| `zbs_cluster_used_data_space_bytes` | The size of used data space. |
| `zbs_cluster_failure_data_space_bytes` | the failure data space |
| `zbs_cluster_provisioned_data_space_bytes` | The size of provisioned data space. |
| `zbs_cluster_chunks_unsafe_failure_space` | chunks whose used space is larger than cluster unused space |
| `zbs_cluster_zone_space_diff_proportion` | zone space diff quotient cluster total spaces |
| `zbs_cluster_temporary_replica_space_bytes` | cluster temporary replica space used |
| `zbs_cluster_temporary_replica_num` | cluster temporary replica num |

**Cluster Migration & Recovery**

| Metrics | Description |
| --- | --- |
| `zbs_cluster_pending_migrate_bytes` | The total amount of data to be migrated. |
| `zbs_cluster_pending_recover_bytes` | The total amount of data to be recovered. |
| `zbs_cluster_migrate_speed_bps` | Migration speed. |
| `zbs_cluster_recover_speed_bps` | Recovery speed. |
| `zbs_cluster_recover_migrate_speed_bps` | Recovery & migration speed. |

### Volume Metrics

**Volume Space**

| Metrics | Description |
| --- | --- |
| `zbs_volume_shared_logical_size_bytes` | Shared logical space.|
| `zbs_volume_unique_logical_size_bytes` | unique logical size 啥是 unique,独占？ |
| `zbs_volume_logical_size_bytes` | Total logical space.|

**Volume IO**
| Metrics | Description|    
| --- | --- |
| `zbs_volume_readwrite_latency_ns` | Volume read write latency.|
| `zbs_volume_readwrite_speed_bps` | Volume read write speed.|
| `zbs_volume_readwrite_size_bytes` | Volume read write size.|
| `zbs_volume_readwrite_iops` | Volume read write IOPS. |
| `zbs_volume_readwrite_iop30s` | Volume read write IOPS every 
readwrite_iop30s of volume |
| `zbs_volume_read_latency_ns` | read_latency_ns of volume |
| `zbs_volume_read_speed_bps` | read_speed_bps of volume |
| `zbs_volume_read_size_bytes` | Volume read size. |
| `zbs_volume_read_iops` | Volume read IOPS. |
| `zbs_volume_write_latency_ns` | write_latency_ns of volume |
| `zbs_volume_write_speed_bps` | write_speed_bps of volume |
| `zbs_volume_write_size_bytes` | Volume write size. |
| `zbs_volume_write_iops` | Volume write IOPS. |
| `zbs_volume_avg_iodepth` | Volume average IO depth. |
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
