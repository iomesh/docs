---
id: prerequisites
title: Prerequisites
sidebar_label: Prerequisites
---

IOMesh can be installed on the Kubernetes platform or the Redhat Openshgift Container platform. Before installing and deploying IOMesh, verify the following requirements.

### Cluster Requirements

You can select a Kubernetes cluster or an OpenShift cluster. 

- A Kubernetes cluster should have at least 3 worker nodes. The Kubernetes version should be between 1.17 and 1.25.
- An OpenShift cluster should have at least 3 worker nodes. The OpenShift version should be greater than 4.0.

### Hardware Requirements 

等待中文确认（需要确认 IOMesh 版本的影响范围，仅限于节点硬件配置吗，还是安装部署和后面的使用都涉及）

Hardware requirements vary depending on the IOMesh version. Verify that each worker node meets the following configuration requirements.

**Community Edition**

|Hardware|Requirements|
|---|---|
|CPU|At least 6 cores for each worker node.|
|Memory|At least 12 GB for each worker node.|
|Physical Disks|<p>All-flash mode: Requires no configuration for cache disks; for data disks, at least one SSD with an available capacity greater than 60 GB on each worker node.</p><p>Hybrid-flash mode: For cache disks, at least one SSD with an available capacity greater than 60 GB; for data disks, at least one HDD with an available capacity greater than 60 GB on each worker node.</p>
|Physical NIC|A physical NIC of 10 GBE for IOMesh storage network. |


**Enterprise Edition**

### Network Requirements

等待中文确认，是否分社区版和企业版



### System Space Requirements

Verify that there is at least 100 GB of disk space in the `/opt` directory on each worker node to store IOMesh metadata.


