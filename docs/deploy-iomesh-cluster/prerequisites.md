---
id: prerequisites
title: Prerequisites
sidebar_label: Prerequisites
---

Before installing and deploying IOMesh, verify the following requirements.

### Cluster Requirements

A Kubernetes cluster or an OpenShift cluster, either of which should have at least 3 worker nodes. The Kubernetes version should be between 1.17 and 1.25, or the OpenShift version between 4.0 and 4.11.

### Hardware Requirements 

Verify that each worker node meets the following configuration requirements.

**CPU**

The CPU architecture should be Intel x86_64, Hygon x86_64, or Kunpeng AArch64, and each worker node should have at least 8 cores.

**Memory**

At least 16 GB on each worker node.

**Storage Controller**

The storage controller should be the SAS HBA or RAID cards that support passthrough mode (JBOD). 

**OS Disk**

Each worker node should have an SSD with 100 GB free space in `/opt` directory for storing IOMesh metadata.

**Data & Cache Disk**

Depends on whether the storage architecture is tiered storage or non-tiered storage.

|Architecture|Description|
|---|---|
|Tiered Storage| Faster storage media for cache and slower storage media for capacity. For example, use faster NVMe SSDs as cache disks and slower SATA SSDs or HDDs as data disks. IOMesh 1.0 supports only hybrid mode for tiered storage.|
|Non-Tiered Storage|Cache disks are not required. All disks except the physical disk containing the system partition are used as data disks.|

In IOMesh 1.0, hybrid mode is only supported for tiered storage, and all-flash mode is supported for non-tiered storage.

|Deployment Mode|Disk Requirements|
|---|---|
|Hybrid Mode|<p>At least 2 SATA, SAS or NVMe SSDs.</p><p>At least 4 SAS or SATA HDDs.</P><p>The total SSD disk capacity should be 10% to 20% of the total HDD disk capacity.</P>|
|All-Flash Mode|At least 2 SSDs, each with a capacity greater than 60G.|

**NIC**

Each worker node should have at least one 10/25 GbE NIC.

### Network Requirements
To avoid contention for network bandwidth, a storage network is required for exclusive use by IOMesh, either by creating one or using an existing network.

Additionally, consider the following:
- All worker nodes must be connected to the L2 layer network.
- The ping latency of the IOMesh storage network is below 1 ms.

