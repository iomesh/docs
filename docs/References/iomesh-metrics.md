---
id: iomesh-metrics
title: IOMesh Metrics
sidebar_label: IOMesh Metrics
---

IOMesh provides Prometheus format metrics for monitoring IOMesh storage at the cluster, chunk or volume level.

### Cluster Metrics

**Cluster License**

| Metrics | Description |
| --- | --- |
| `zbs_cluster_license_already_expire` | Shows if the license expires.|
| `zbs_cluster_license_expire_day` | Shows the date when the license expires. |
| `zbs_cluster_license_subscription_expire_day` | Shows the date when the subscription license expires. |
| `zbs_cluster_license_subscription_already_expire` | Shows if the subscription license expires. |

**Cluster IO**

| Metrics | Description |
| --- | --- |
| `zbs_cluster_read_iops` | Cluster read IOPS. |
| `zbs_cluster_readwrite_iops` | Cluster read write IOPS. |
| `zbs_cluster_write_iops` | C;luster write IOPS. |
| `zbs_cluster_read_speed_bps` | Cluster read speed. |
| `zbs_cluster_write_speed_bps` | Cluster write speed. |
| `zbs_cluster_readwrite_speed_bps` | Cluster read write speed. |
| `zbs_cluster_avg_readwrite_latency_ns` | Cluster read write latency. |
| `zbs_cluster_avg_write_latency_ns` | Cluster write latency. |
| `zbs_cluster_avg_read_latency_ns` | Cluster read latency. |
| `zbs_cluster_avg_write_size_bytes` | Average write request size. |
| `zbs_cluster_avg_read_size_bytes` | Average write request size. |
| `zbs_cluster_avg_readwrite_size_bytes` | Average read write request size. |

**Cluster Cache**

| Metrics | Description |
| --- | --- |
| `zbs_cluster_write_cache_hit_ratio` | Write cache hit ratio. |
| `zbs_cluster_failure_cache_space_bytes` | The amount of failed cache space.|
| `zbs_cluster_cache_capacity_bytes` | Total cache space. |
| `zbs_cluster_dirty_cache_space_bytes` | Dirty cache space. |
| `zbs_cluster_readwrite_cache_hit_ratio` | Read write cache hit ratio. |
| `zbs_cluster_used_cache_space_bytes` | Used cache space. |
| `zbs_cluster_valid_cache_space_bytes` | Valid cache space. |
| `zbs_cluster_dirty_cache_ratio` | Dirty cache ratio.|
| `zbs_cluster_read_cache_hit_ratio` | Read cache hit ratio. |

**Cluster Space Size**

| Metrics | Description |
| --- | --- |
| `zbs_cluster_data_capacity_bytes` | The total data capacity. |
| `zbs_cluster_data_space_use_rate` | Max(provisioned space, used space)/valid data space. |
| `zbs_cluster_unique_logical_size_bytes` | Logical size dedicated to a specific volume. |
| `zbs_cluster_shared_logical_size_bytes` | Shared logical size. |
| `zbs_cluster_logical_size_bytes` | Total logical size. |
| `zbs_cluster_valid_data_space_bytes` | Valid data space. |
| `zbs_cluster_used_data_space_bytes` | The size of used data space. |
| `zbs_cluster_failure_data_space_bytes` | The size of failed data space. |
| `zbs_cluster_provisioned_data_space_bytes` | The size of provisioned data space. |
| `zbs_cluster_chunks_unsafe_failure_space` | Shows if space used by chunks is larger than the unused space in the cluster. |
| `zbs_cluster_temporary_replica_space_bytes` | Space consumed by temporary replicas in the cluster.|
| `zbs_cluster_temporary_replica_num` | Number of temporary replicas in the cluster.|

**Cluster Migration & Recovery**

| Metrics | Description |
| --- | --- |
| `zbs_cluster_pending_migrate_bytes` | The total amount of data to be migrated. |
| `zbs_cluster_pending_recover_bytes` | The total amount of data to be recovered. |
| `zbs_cluster_migrate_speed_bps` | Migration speed. |
| `zbs_cluster_recover_speed_bps` | Recovery speed. |
| `zbs_cluster_recover_migrate_speed_bps` | Recovery & migration speed. |

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
| `zbs_chunk_avg_read_latency_ns` | Chunk read latency. |
| `zbs_chunk_write_iops` | Chunk write IOPS. |
| `zbs_chunk_write_speed_bps` | Chunk write speed.|
| `zbs_chunk_avg_write_size_bytes` |Average write request size.|
| `zbs_chunk_avg_write_latency_ns` | Chunk write latency. |
| `zbs_chunk_readwrite_iops` | Chunk read write IOPS. |
| `zbs_chunk_readwrite_speed_bps` | Chunk read write speed. |
| `zbs_chunk_avg_readwrite_size_bytes` | Average read write request size.|
| `zbs_chunk_avg_readwrite_latency_ns` | Chunk read write latency. |

**Chunk Cache Space**
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

**Chunk Data Space**
| Metrics | Description |
| --- | --- |
| `zbs_chunk_used_data_space_bytes` | The amount of used data space.|
| `zbs_chunk_data_capacity_bytes` | The total amount of data space. |
| `zbs_chunk_provisioned_data_space_bytes` | The amount of provisioned data space.|
| `zbs_chunk_data_space_use_rate` | Max(provisioned space, used space)/valid data space. |
| `zbs_chunk_valid_data_space_bytes` | The amount of valid data space. |
| `zbs_chunk_failure_data_space_bytes` | The amount of failed data space.|

**Chunk Temporary Replica**
| Metrics | Description |
| --- | --- |
| `zbs_chunk_temporary_replica_space_bytes` | Space used by temporary replicas.|
| `zbs_chunk_temporary_replica_num` | The number of temporary chunk replicas.|

**Chunk Migration & Recovery**

| Metrics | Description |
| --- | --- |
| `zbs_chunk_pending_migrate_bytes` | The total amount of data to be migrated.|
| `zbs_chunk_pending_recover_bytes` | The total amount of data to be recovered. |
| `zbs_chunk_recover_speed_bps` | Recovery speed |
| `zbs_chunk_migrate_speed_bps` | Migration speed. |
| `zbs_chunk_recover_migrate_speed_bps` | Recovery & migration speed. |

### Volume Metrics

**Volume Space**

| Metrics | Description |
| --- | --- |
| `zbs_volume_shared_logical_size_bytes` | Shared logical size.|
| `zbs_volume_unique_logical_size_bytes` | Logical size dedicated to a specific volume.|
| `zbs_volume_logical_size_bytes` | Total logical size.|

**Volume IO**
| Metrics | Description|    
| --- | --- |
| `zbs_volume_readwrite_latency_ns` | Volume read write latency.|
| `zbs_volume_readwrite_speed_bps` | Volume read write speed.|
| `zbs_volume_readwrite_size_bytes` | Volume read write size.|
| `zbs_volume_readwrite_iops` | Volume read write IOPS. |
| `zbs_volume_readwrite_iop30s` | Volume read write IOPS at a interval of 30 seconds.|
| `zbs_volume_read_latency_ns` | Volume read latency.|
| `zbs_volume_read_speed_bps` | Volume read speed. |
| `zbs_volume_read_size_bytes` | Volume read size. |
| `zbs_volume_read_iops` | Volume read IOPS. |
| `zbs_volume_write_latency_ns` | Volume write latency.|
| `zbs_volume_write_speed_bps` | Volume write speed. |
| `zbs_volume_write_size_bytes` | Volume write size. |
| `zbs_volume_write_iops` | Volume write IOPS. |
| `zbs_volume_avg_iodepth` | Volume average IO depth. |

