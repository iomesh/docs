---
id: monitoring
title: Monitoring
sidebar_label: Monitoring
---

IOMesh cluster can be monitored by Prometheus and Grafana.

## Integrating with Prometheus

If Prometheus is installed by [Prometheus Operator][1]. Just modify `iomesh-values.yaml` with:

```yaml
serviceMonitor:
  create: true
```

Then upgrade the installed IOMesh Cluster:

> **_NOTE_: replace `my-iomesh` with your release name.**

```bash
helm upgrade --namespace iomesh-system my-iomesh iomesh/iomesh --values iomesh-values.yaml
```

The exporter will be created and metric data would be collected by Prometheus automatically.

It is also possible to config Prometheus mannually by importing [iomesh-prometheus-kubernetes-sd-example.yaml][4]

## Integrating with Grafana

Download and import [iomesh-dashboard.json][3] to any installed Grafana.

## Whole Metrics

The whole metrics are shown below:

### zone:io

| metrics name | describe |
| --- | --- |
| `zbs_zone_read_speed_bps` | read speed |
| `zbs_zone_read_iops` | read iops |
| `zbs_zone_avg_read_latency_ns` | read latency |
| `zbs_zone_avg_read_size_bytes` | read avg request size |
| `zbs_zone_write_speed_bps` | write speed |
| `zbs_zone_write_iops` | write iops |
| `zbs_zone_avg_write_latency_ns` | write latency |
| `zbs_zone_avg_write_size_bytes` | write avg request size |
| `zbs_zone_readwrite_speed_bps` | read write speed |
| `zbs_zone_readwrite_iops` | read write iops |
| `zbs_zone_avg_readwrite_latency_ns` | read write latency |
| `zbs_zone_avg_readwrite_size_bytes` | read write avg request size |

### zone:cache

| metrics name | describe |
| --- | --- |
| `zbs_zone_cache_capacity_bytes` | total cache capacity |
| `zbs_zone_read_cache_hit_ratio` | read cache hit ratio |
| `zbs_zone_write_cache_hit_ratio` | write cache hit ratio |
| `zbs_zone_readwrite_cache_hit_ratio` | read write cache hit ratio |
| `zbs_zone_dirty_cache_ratio` | dirty cache ratio |
| `zbs_zone_dirty_cache_space_bytes` | the dirty cache space |
| `zbs_zone_valid_cache_space_bytes` | the valid cache space |
| `zbs_zone_used_cache_space_bytes` | the used cache space |
| `zbs_zone_failure_cache_space_bytes` | the failure cache space |

### zone:data

| metrics name | describe |
| --- | --- |
| `zbs_zone_data_capacity_bytes` | total data capacity |
| `zbs_zone_used_data_space_bytes` | the used data space |
| `zbs_zone_data_space_use_rate` | max(provisioned space, used space) / valid data space |
| `zbs_zone_valid_data_space_bytes` | the valid data space |
| `zbs_zone_data_space_redundancy` | data space redundancy |
| `zbs_zone_provisioned_data_space_bytes` | the provisioned data space |
| `zbs_zone_maximum_proportion_of_rack_space` | maximum proportion of rack space in the zone |
| `zbs_zone_failure_data_space_bytes` | the failure data space |

### zone:migrate&recover

| metrics name | describe |
| --- | --- |
| `zbs_zone_pending_migrate_bytes` | pending migrate |
| `zbs_zone_pending_recover_bytes` | pending recover |
| `zbs_zone_recover_speed_bps` | recover speed |
| `zbs_zone_migrate_speed_bps` | migrate speed |
| `zbs_zone_recover_migrate_speed_bps` | recover + migrate speed |

### zone:cross zone stats

| metrics name | describe |
| --- | --- |
| `zbs_zone_cross_zone_data_speed_bps` | total cross zone data transfer speed, io + recover + migrate |
| `zbs_zone_cross_zone_read_iops` | cross zone read iops |
| `zbs_zone_cross_zone_read_speed_bps` | cross zone read speed |
| `zbs_zone_cross_zone_write_iops` | cross zone write iops |
| `zbs_zone_cross_zone_write_speed_bps` | cross zone write speed |
| `zbs_zone_cross_zone_readwrite_iops` | cross zone read write iops |
| `zbs_zone_cross_zone_readwrite_speed_bps` | cross zone read write speed |
| `zbs_zone_cross_zone_migrate_speed_bps` | cross zone migrate speed |
| `zbs_zone_cross_zone_recover_speed_bps` | cross zone recover speed |
| `zbs_zone_cross_zone_recover_migrate_speed_bps` | cross zone recover + migrate speed |

### storage pool:io

| metrics name | describe |
| --- | --- |
| `zbs_storage_pool_read_iops` | read iops |
| `zbs_storage_pool_read_speed_bps` | read speed |
| `zbs_storage_pool_avg_read_size_bytes` | read avg request size |
| `zbs_storage_pool_avg_read_latency_ns` | read latency |
| `zbs_storage_pool_write_iops` | write iops |
| `zbs_storage_pool_write_speed_bps` | write speed |
| `zbs_storage_pool_avg_write_latency_ns` | write latency |
| `zbs_storage_pool_avg_write_size_bytes` | write avg request size |
| `zbs_storage_pool_readwrite_iops` | read write iops |
| `zbs_storage_pool_readwrite_speed_bps` | read write speed |
| `zbs_storage_pool_avg_readwrite_size_bytes` | read write avg request size |
| `zbs_storage_pool_avg_readwrite_latency_ns` | read write latency |

### storage pool:cache

| metrics name | describe |
| --- | --- |
| `zbs_storage_pool_cache_capacity_bytes` | total cache capacity |
| `zbs_storage_pool_read_cache_hit_ratio` | read cache hit ratio |
| `zbs_storage_pool_write_cache_hit_ratio` | write cache hit ratio |
| `zbs_storage_pool_readwrite_cache_hit_ratio` | read write cache hit ratio |
| `zbs_storage_pool_dirty_cache_ratio` | dirty cache ratio |
| `zbs_storage_pool_dirty_cache_space_bytes` | the dirty cache space |
| `zbs_storage_pool_used_cache_space_bytes` | the used cache space |
| `zbs_storage_pool_valid_cache_space_bytes` | the valid cache space |
| `zbs_storage_pool_failure_cache_space_bytes` | the failure cache space |

### stoarge pool:data

| metrics name | describe |
| --- | --- |
| `zbs_storage_pool_data_capacity_bytes` | total data capacity |
| `zbs_storage_pool_used_data_space_bytes` | the used data space |
| `zbs_storage_pool_data_space_use_rate` | max(provisioned space, used space) / valid data space |
| `zbs_storage_pool_valid_data_space_bytes` | the valid data space |
| `zbs_storage_pool_provisioned_data_space_bytes` | the provisioned data space |
| `zbs_storage_pool_failure_data_space_bytes` | the failure data space |

### storage pool:migrate&recover

| metrics name | describe |
| --- | --- |
| `zbs_storage_pool_pending_recover_bytes` | pending recover |
| `zbs_storage_pool_pending_migrate_bytes` | pending migrate |
| `zbs_storage_pool_recover_speed_bps` | recover speed |
| `zbs_storage_pool_migrate_speed_bps` | migrate speed |
| `zbs_storage_pool_recover_migrate_speed_bps` | recover + migrate speed |

### storage pool:cross zone stats

| metrics name | describe |
| --- | --- |
| `zbs_storage_pool_cross_zone_data_speed_bps` | total cross zone data transfer speed, io + recover + migrate |
| `zbs_storage_pool_cross_zone_read_iops` | cross zone read iops |
| `zbs_storage_pool_cross_zone_read_speed_bps` | cross zone read speed |
| `zbs_storage_pool_cross_zone_write_iops` | cross zone write iops |
| `zbs_storage_pool_cross_zone_write_speed_bps` | cross zone write speed |
| `zbs_storage_pool_cross_zone_readwrite_iops` | cross zone read write iops |
| `zbs_storage_pool_cross_zone_readwrite_speed_bps` | cross zone read write speed |
| `zbs_storage_pool_cross_zone_recover_migrate_speed_bps` | cross zone recover + migrate speed |
| `zbs_storage_pool_cross_zone_recover_speed_bps` | cross zone recover speed |
| `zbs_storage_pool_cross_zone_migrate_speed_bps` | cross zone migrate speed |

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

### chunk:data

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

### chunk:cross zone stats

| metrics name | describe |
| --- | --- |
| `zbs_chunk_cross_zone_recover_migrate_speed_bps` | cross zone recover + migrate speed |
| `zbs_chunk_cross_zone_recover_speed_bps` | cross zone recover speed |
| `zbs_chunk_cross_zone_readwrite_iops` | cross zone read write iops |
| `zbs_chunk_cross_zone_data_speed_bps` | total cross zone data transfer speed, io + recover + migrate |
| `zbs_chunk_cross_zone_read_speed_bps` | cross zone read speed |
| `zbs_chunk_cross_zone_readwrite_speed_bps` | cross zone read write speed |
| `zbs_chunk_cross_zone_read_iops` | cross zone read iops |
| `zbs_chunk_cross_zone_write_speed_bps` | cross zone write speed |
| `zbs_chunk_cross_zone_write_iops` | cross zone write iops |
| `zbs_chunk_cross_zone_migrate_speed_bps` | cross zone migrate speed |

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

### cluster:topology

| metrics name | describe |
| --- | --- |
| `zbs_rack_maximum_proportion_of_brick_space` | maximum proportion of brick space in the rack |
| `zbs_cluster_bricks_without_topo` | bricks which are not put in any rack |
| `zbs_cluster_chunks_without_topo` | chunks which are not assigned to bricks |

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

### cluster:cross zone stats

| metrics name | describe |
| --- | --- |
| `zbs_cluster_cross_zone_data_speed_bps` | total cross zone data transfer speed, io + recover + migrate |
| `zbs_cluster_cross_zone_recover_migrate_speed_bps` | cross zone recover + migrate speed |
| `zbs_cluster_cross_zone_readwrite_speed_bps` | cross zone read write speed |
| `zbs_cluster_cross_zone_read_iops` | cross zone read iops |
| `zbs_cluster_cross_zone_write_iops` | cross zone write iops |
| `zbs_cluster_cross_zone_readwrite_iops` | cross zone read write iops |
| `zbs_cluster_cross_zone_read_speed_bps` | cross zone read speed |
| `zbs_cluster_cross_zone_write_speed_bps` | cross zone write speed |
| `zbs_cluster_cross_zone_migrate_speed_bps` | cross zone migrate speed |
| `zbs_cluster_cross_zone_recover_speed_bps` | cross zone recover speed |

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

[1]: https://github.com/prometheus-operator/prometheus-operator
[2]: https://grafana.com/grafana/download
[3]: http://www.iomesh.com/docs/assets/iomesh-operation/iomesh-dashboard.json
[4]: http://www.iomesh.com/docs/assets/iomesh-operation/iomesh-prometheus-kubernetes-sd-example.yaml
