---
id: prerequisites
title: Prerequisites
sidebar_label: Prerequisites
---

Before installing and deploying IOMesh, verify the following requirements.

> _NOTE:_ Expanding an IOMesh cluster to multiple clusters is not currently supported. Decide at the beginning whether to deploy one or multiple clusters. For multi-cluster deployment and operations, refer to [Multiple Cluster Management](../advanced-functions/multiple-cluster-management.md).

## Cluster Requirements

- A Kubernetes or OpenShift cluster with minimum 3 worker nodes.
- The Kubernetes version should be 1.17-1.25 or OpenShift version should be 3.11-4.10.

## Hardware Requirements 

Ensure that each worker node has the following hardware configurations, and note that IOMesh Community and Enterprise editions have the same hardware requirements.

**CPU**

- The CPU architecture should be AArch64 or x86_64.
- At least 8 cores for each worker node.

**Memory**

At least 16 GB on each worker node.

**Storage Controller**

SAS HBA or RAID cards that support passthrough mode (JBOD). 

**OS Disk**

An SSD with at least 100 GB of free space in the /opt directory for storing IOMesh metadata.

**Data & Cache Disk**

Depends on whether the storage architecture is tiered storage or non-tiered storage.

|Architecture|Description|
|---|---|
|Tiered Storage| Faster storage media for cache and slower storage media for capacity. For example, use faster NVMe SSDs as cache disks and slower SATA SSDs or HDDs as data disks.|
|Non-Tiered Storage|Cache disks are not required. All disks except the physical disk containing the system partition are used as data disks.|

In IOMesh 1.0, hybrid mode is only supported for tiered storage and all-flash mode for non-tiered storage.

|Deployment Mode|Disk Requirements|
|---|---|
|Hybrid Mode|<ul><li>Cache Disk: At least 1 SATA SSD, SAS SSD or NVMe SSD, and the capacity must be greater than 60 GB.</li><li>Data Disk: At least 1 SATA HDD or SAS HDD.</li><li>The total SSD disk capacity should be 10% to 20% of total HDD disk capacity.</li></ul>|
|All-Flash Mode|At least 1 SSD with a capacity greater than 60G.|

**NIC**

Each worker node should have at least one 10/25 GbE NIC.

## Network Requirements

To prevent network bandwidth contention, create a dedicated storage network for IOMesh or leverage an existing network. 

- Plan a CIDR for IOMesh storage network. The IP of each worker node running IOMesh should be within that CIDR.
- The ping latency of the IOMesh storage network should below 1 ms.
- All worker nodes must be connected to the L2 layer network.


