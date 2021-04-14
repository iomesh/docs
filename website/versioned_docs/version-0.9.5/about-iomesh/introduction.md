---
id: version-0.9.5-introduction
title: Introduction
sidebar_label: Introduction
original_id: introduction
---

## What is IOMesh？

IOMesh is a distributed storage system specially designed for Kubernetes workloads, providing reliable persistent storage capabilities for containerized stateful applications such as MySQL, Cassandra, and MongoDB.

- Thousands of Pods are created and destroyed every minute in Kubernetes clusters. IOMesh is built for this kind of highly dynamic and large-scale workloads in the cloud-native era. It is designed with this in mind from the beginning to provide the performance, reliability, and scalability required by cloud-native applications.
- IOMesh runs natively on Kubernetes and fully utilizes the Kubernetes's capabilities. Therefore, the operation teams can leverage the standard Kubernetes APIs to uniformly manage the applications and IOMesh, which integrates perfectly with existing DevOps processes.
- IOMesh enables users to start at a small scale and expand the storage at will by adding disks or nodes.

## Key Features

### High Performance
   Database is one of the key applications to measure storage performance. IOMesh performes very well in the database performance benchmark tests with stable read and write latency and high QPS and TPS, which means that it can provide stable data services.
### No Kernel Dependencies
   IOMesh runs entirely in user space and can provide reliable service through effective software fault isolation. When a problem occurs, other applications running on the same node can continue to run without causing the entire system to crash. In addition, deploying and maintaining the IOMesh are very easy since there is no need to install any kernel modules and you do not need to worry about the kernel version compatibility.
### Storage Performance Tiering
   IOMesh supports flexible deployment of hybrid disks including NVMe SSD, SATA SSD and HDD. This can help users make the most of their storage investment, and control the costs to each block while maximizing the storage performance.

## Architecture

![img](https://lh3.googleusercontent.com/4Yssin2b7eH5xylvgJ5Do0khj8Dlfv_cG8F-sHrJ7ztah5ixKleRvL_uX_b8maQ1w72lPoallwviBzvCMVgQUFrV6y2yFWNmXk4wQNAMNfaLMMeRQ9cIWznvF-gZeOeP4SnGUOsF)

## Compatibility List with Kubernetes

| IOMesh Version | Kubernetes Version |
| -------------- | ------------------ |
| v0.9.x         | v1.17 or higher    |
